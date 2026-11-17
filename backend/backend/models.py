from django.db import models
from django.contrib.auth.models import User

# AI Gen
class Company(models.Model):
    name = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name

# AI Gen
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    resume = models.FileField(upload_to='resumes/', blank=True)

    def __str__(self):
        return f'{self.user.username} profile'

# AI Gen
class Job(models.Model):
    EMPLOYMENT_TYPES = (
        ('full_time', 'Full time'),
        ('part_time', 'Part time'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='jobs')
    location = models.CharField(max_length=100)
    salary_range = models.CharField(max_length=50, blank=True)
    hiring_start = models.DateField(null=True, blank=True)
    hiring_end = models.DateField(null=True, blank=True)
    eligibility = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES, default='full_time')
    posted_on = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

class Application(models.Model):
    STATIC_CHOICE = (
        ('pending','Pending'),
        ('shortlisted','Shotlisted'),
        ('rejected','Rejected'),
        ('hired', 'Hired'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applicant = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATIC_CHOICE, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)
