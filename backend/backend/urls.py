"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import hello, register_user, basic_login, logout_user, job_list, company_list, create_job, apply_jobs, my_applications, profile_details, profile_resume

urlpatterns = [
    path('admin/', admin.site.urls),
    path('hello', hello),
    path('register', register_user),
    path('login', basic_login),
    path('logout', logout_user),
    path('jobs', job_list),
    path('companies', company_list),
    path('jobs/create', create_job),
    path('apply', apply_jobs),
    path('applications', my_applications),
    path('profile', profile_details),
    path('profile/resume', profile_resume),
]
