import tempfile

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Application, Company, Job


class ProtectedJobActionsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='poster',
            email='poster@example.com',
            password='test-password',
        )
        self.token = Token.objects.create(user=self.user)
        self.company = Company.objects.create(name='Example Co')
        self.job = Job.objects.create(
            title='Engineer',
            description='Build software.',
            company=self.company,
            location='Remote',
            created_by=self.user,
        )

    def test_job_posting_requires_login_and_uses_authenticated_user(self):
        payload = {
            'title': 'Designer',
            'description': 'Design product experiences.',
            'company': 'New Company',
            'location': 'Remote',
            'employment_type': 'full_time',
        }

        response = self.client.post('/jobs/create', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Company.objects.filter(name='New Company').exists())

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post('/jobs/create', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_job = Job.objects.get(pk=response.data['job_id'])
        self.assertEqual(created_job.created_by, self.user)
        self.assertEqual(created_job.company.name, 'New Company')

    def test_applying_requires_login_and_uses_authenticated_user(self):
        response = self.client.post('/apply', {'job': self.job.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Application.objects.count(), 0)

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post('/apply', {'job': self.job.id}, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Application.objects.get(job=self.job).applicant, self.user)

    def test_logging_out_revokes_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post('/logout')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post('/apply', {'job': self.job.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_requires_login_and_includes_shortlist_notifications(self):
        response = self.client.get('/profile')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        Application.objects.create(
            job=self.job,
            applicant=self.user,
            status='shortlisted',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get('/profile')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'poster')
        self.assertEqual(response.data['email'], 'poster@example.com')
        self.assertEqual(len(response.data['notifications']), 1)
        self.assertEqual(response.data['notifications'][0]['company'], 'Example Co')

    def test_resume_upload_and_download_require_the_owner_token(self):
        response = self.client.post(
            '/profile/resume',
            {'resume': SimpleUploadedFile('resume.pdf', b'%PDF test resume')},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        with tempfile.TemporaryDirectory() as media_directory:
            with override_settings(MEDIA_ROOT=media_directory):
                response = self.client.post(
                    '/profile/resume',
                    {'resume': SimpleUploadedFile('resume.pdf', b'%PDF test resume')},
                    format='multipart',
                )
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response.data['resume_name'], 'resume.pdf')

                response = self.client.get('/profile/resume')
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(b''.join(response.streaming_content), b'%PDF test resume')
