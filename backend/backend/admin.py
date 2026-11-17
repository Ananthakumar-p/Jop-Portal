from django.contrib import admin
from .models import Application, Company, Job, UserProfile

admin.site.register(Company)
admin.site.register(Job)
admin.site.register(Application)
admin.site.register(UserProfile)