from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Application, Company, Job

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class JobSerializer(serializers.ModelSerializer):
    created_by=serializers.StringRelatedField() #give foringkey details in str format
    company = serializers.StringRelatedField()

    class Meta:
        model=Job
        fields="__all__"

# AI Gen
class CompanySerializer(serializers.ModelSerializer):
    jobs = JobSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'name', 'jobs']

# AI Gen
class JobCreateSerializer(serializers.ModelSerializer):
    company = serializers.CharField(max_length=150)

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'description',
            'company',
            'location',
            'salary_range',
            'hiring_start',
            'hiring_end',
            'eligibility',
            'requirements',
            'employment_type',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        start = attrs.get('hiring_start')
        end = attrs.get('hiring_end')
        if start and end and end < start:
            raise serializers.ValidationError({
                'hiring_end': 'The hiring end date must be on or after the start date.'
            })
        return attrs

    def create(self, validated_data):
        company_name = validated_data.pop('company').strip()
        company, _ = Company.objects.get_or_create(name=company_name)
        return Job.objects.create(company=company, **validated_data)

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'job', 'status', 'applied_on']
        read_only_fields = ['id', 'applied_on']

# AI gen
class MyApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'status', 'applied_on']
        