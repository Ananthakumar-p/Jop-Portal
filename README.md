# JobPortal

JobPortal is a job search and hiring portal. Job seekers can browse jobs and companies, apply for opportunities, and track their applications. Employers can post job openings.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Django, Django REST Framework
- Database: PostgreSQL

## Project structure

```text
backend/    Django API and deployment configuration
frontend/   React application
```

## Requirements

- Python
- Node.js and npm
- A PostgreSQL database (a Neon connection string can be used)

## Backend setup

1. Open a terminal in `backend/`.
2. Create and activate a virtual environment, then install dependencies:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   ```

3. Create `backend/.env` and set your database connection string:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
   ```

   For Cloudinary-backed media uploads, also set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

4. Apply migrations and optionally create an admin account:

   ```powershell
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. Start the API:

   ```powershell
   python manage.py runserver
   ```

The Django admin is available at `http://127.0.0.1:8000/admin/`.

> `migrate` and `createsuperuser` use the database configured by `DATABASE_URL`. Check that it points to the intended database before running these commands. Do not commit database credentials or other secrets.

## Frontend setup

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite prints the local frontend URL when the development server starts. The frontend expects the Django API at `http://127.0.0.1:8000`.

To build or lint the frontend:

```powershell
npm run build
npm run lint
```

## Deployment

The Render configuration and build script are in `backend/render.yaml` and `backend/build.sh`. Configure `DATABASE_URL` and any required Cloudinary credentials in the hosting provider's environment settings. The service root directory should be `backend` so the build script and Django `manage.py` are available.

Before deploying publicly, configure Django for production, including a secure `SECRET_KEY`, `DEBUG=False`, and appropriate `ALLOWED_HOSTS`.
