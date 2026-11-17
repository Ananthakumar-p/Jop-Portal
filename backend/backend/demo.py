from datetime import date, timedelta

from django.contrib.auth.models import User

from .models import Company, Job


user = User.objects.get(username="aadhiraf")
today = date.today()

sample_jobs = [
    {
        "company": "PixelCraft",
        "title": "Frontend Engineer",
        "description": "Build responsive web interfaces with React, Next.js, and Tailwind CSS.",
        "location": "Chennai",
        "salary_range": "6-10 LPA",
        "hiring_start": today - timedelta(days=7),
        "hiring_end": today + timedelta(days=30),
        "eligibility": "0-3 years of experience; degree in computer science or equivalent practical experience.",
        "requirements": "Strong JavaScript and React skills; familiarity with responsive design, Git, and REST APIs.",
        "employment_type": "full_time",
    },
    {
        "company": "CloudSphere",
        "title": "DevOps Engineer",
        "description": "Manage CI/CD pipelines, container platforms, and cloud infrastructure.",
        "location": "Pune",
        "salary_range": "12-16 LPA",
        "hiring_start": today + timedelta(days=14),
        "hiring_end": today + timedelta(days=45),
        "eligibility": "At least 2 years of experience in DevOps, infrastructure, or site reliability engineering.",
        "requirements": "Hands-on Docker, Kubernetes, CI/CD, and AWS or Azure experience.",
        "employment_type": "full_time",
    },
    {
        "company": "Appify",
        "title": "Mobile App Developer Intern",
        "description": "Help build and test cross-platform mobile applications using Flutter and Dart.",
        "location": "Mumbai",
        "salary_range": "20,000-30,000 INR/month",
        "hiring_start": today - timedelta(days=4),
        "hiring_end": today + timedelta(days=20),
        "eligibility": "Current student or recent graduate in computer science or a related field.",
        "requirements": "Basic Dart or Flutter knowledge, a portfolio or project sample, and willingness to learn.",
        "employment_type": "internship",
    },
    {
        "company": "InsightAI",
        "title": "Data Scientist",
        "description": "Develop machine learning models and data pipelines for analytics products.",
        "location": "Delhi",
        "salary_range": "15-20 LPA",
        "hiring_start": today - timedelta(days=60),
        "hiring_end": today - timedelta(days=10),
        "eligibility": "At least 2 years of relevant experience and a degree in a quantitative field or equivalent experience.",
        "requirements": "Python, SQL, statistics, and practical experience with machine learning workflows.",
        "employment_type": "full_time",
    },
    {
        "company": "DesignHub",
        "title": "UI/UX Designer",
        "description": "Design accessible interfaces and improve product experiences through research and prototyping.",
        "location": "Kolkata",
        "salary_range": "5-8 LPA",
        "hiring_start": today + timedelta(days=21),
        "hiring_end": today + timedelta(days=60),
        "eligibility": "A portfolio demonstrating interface design and user-centered problem solving.",
        "requirements": "Figma proficiency, wireframing, prototyping, and clear communication with product teams.",
        "employment_type": "freelance",
    },
    {
        "company": "SecureNet",
        "title": "Cybersecurity Analyst",
        "description": "Monitor systems, investigate security alerts, and help strengthen security controls.",
        "location": "Bangalore",
        "salary_range": "10-14 LPA",
        "hiring_start": today - timedelta(days=10),
        "hiring_end": today + timedelta(days=35),
        "eligibility": "At least 1 year of security operations or information security experience.",
        "requirements": "Knowledge of SIEM tools, incident response, networking, and security fundamentals.",
        "employment_type": "part_time",
    },
]

for job_data in sample_jobs:
    company, _ = Company.objects.get_or_create(name=job_data["company"])
    Job.objects.update_or_create(
        company=company,
        title=job_data["title"],
        defaults={**job_data, "company": company, "created_by": user},
    )
