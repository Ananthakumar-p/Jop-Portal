from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from django.contrib.auth.models import User
from django.http import FileResponse
from rest_framework.authtoken.models import Token
from pathlib import Path
from .models import Application, Company, Job, UserProfile
from .serializers import ApplicationSerializer, CompanySerializer, JobCreateSerializer, JobSerializer, MyApplicationSerializer, RegisterSerializer

@api_view(['GET'])
def hello(request):
    return Response({"message": "hello from django"})

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save() # saves user
        return Response({"message": "your registered successfully!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

# AI Gen
@api_view(['POST'])
def basic_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.filter(username=username).first()
    if user and not user.check_password(password or '') and user.password == password:
        user.set_password(password)
        user.save(update_fields=['password'])

    if not user or not user.check_password(password or ''):
        return Response({"message": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {
            "user_id": user.id,
            "username": user.username,
            "token": token.key,
            "message": "Login successful",
        },
        status=status.HTTP_200_OK,
    )

# AI Gen
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    request.auth.delete()
    return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
def job_list(request):
    jobs = Job.objects.all()
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

# AI Gen
@api_view(['GET'])
def company_list(request):
    companies = Company.objects.prefetch_related('jobs').order_by('name')
    serializer = CompanySerializer(companies, many=True)
    return Response(serializer.data)

# AI Gen
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_job(request):
    serializer = JobCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(
            {"message": "Job posted successfully.", "job_id": serializer.data['id']},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_jobs(request):
    job_id = request.data.get('job')
    # check application exist
    if Application.objects.filter(job_id=job_id, applicant=request.user).exists():
        return Response({"message":"You Already Applied"}, status=status.HTTP_400_BAD_REQUEST)
    serializer = ApplicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(applicant=request.user)
        return Response({"message": "Application Submitted"}, status.HTTP_201_CREATED)
    return Response(serializer.errors, status.HTTP_400_BAD_REQUEST) 

# AI gen
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    applications = Application.objects.filter(applicant=request.user).select_related('job').order_by('-applied_on')
    serializer = MyApplicationSerializer(applications, many=True)
    return Response(serializer.data)

# AI Gen
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_details(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    shortlisted = Application.objects.filter(
        applicant=request.user,
        status='shortlisted',
    ).select_related('job__company').order_by('-applied_on')
    notifications = [
        {
            'id': application.id,
            'job_title': application.job.title,
            'company': application.job.company.name,
            'applied_on': application.applied_on,
        }
        for application in shortlisted
    ]
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'resume_name': Path(profile.resume.name).name if profile.resume else '',
        'notifications': notifications,
    })

# AI Gen
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def profile_resume(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        if not profile.resume:
            return Response({'detail': 'No resume has been uploaded.'}, status=status.HTTP_404_NOT_FOUND)
        return FileResponse(
            profile.resume.open('rb'),
            as_attachment=True,
            filename=Path(profile.resume.name).name,
        )

    uploaded_file = request.FILES.get('resume')
    if not uploaded_file:
        return Response({'resume': 'Choose a resume file to upload.'}, status=status.HTTP_400_BAD_REQUEST)

    extension = Path(uploaded_file.name).suffix.lower()
    if extension not in {'.pdf', '.doc', '.docx'}:
        return Response(
            {'resume': 'Upload a PDF, DOC, or DOCX file.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if uploaded_file.size > 5 * 1024 * 1024:
        return Response({'resume': 'Resume files must be 5 MB or smaller.'}, status=status.HTTP_400_BAD_REQUEST)

    if profile.resume:
        profile.resume.delete(save=False)
    profile.resume.save(uploaded_file.name, uploaded_file, save=True)
    return Response({
        'message': 'Resume uploaded successfully.',
        'resume_name': Path(profile.resume.name).name,
    }, status=status.HTTP_200_OK)