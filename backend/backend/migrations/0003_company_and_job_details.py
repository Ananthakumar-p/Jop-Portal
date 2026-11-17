import django.db.models.deletion
from django.db import migrations, models


def associate_existing_jobs(apps, schema_editor):
    Company = apps.get_model('backend', 'Company')
    Job = apps.get_model('backend', 'Job')

    for job in Job.objects.all().iterator():
        name = (job.company or '').strip() or 'Unknown company'
        company, _ = Company.objects.get_or_create(name=name)
        Job.objects.filter(pk=job.pk).update(company_profile_id=company.pk)


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_alter_application_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='job',
            name='company_profile',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='jobs',
                to='backend.company',
            ),
        ),
        migrations.AddField(
            model_name='job',
            name='hiring_start',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='job',
            name='hiring_end',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='job',
            name='eligibility',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='job',
            name='requirements',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='job',
            name='employment_type',
            field=models.CharField(
                choices=[
                    ('full_time', 'Full time'),
                    ('part_time', 'Part time'),
                    ('internship', 'Internship'),
                    ('freelance', 'Freelance'),
                ],
                default='full_time',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='job',
            name='salary_range',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.RunPython(associate_existing_jobs, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='job',
            name='company',
        ),
        migrations.RenameField(
            model_name='job',
            old_name='company_profile',
            new_name='company',
        ),
        migrations.AlterField(
            model_name='job',
            name='company',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='jobs',
                to='backend.company',
            ),
        ),
    ]
