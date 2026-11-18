import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import LoginPrompt from './LoginPrompt'
import ProfilePage from './ProfilePage'
import api from './api'

function UploadJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const navigate = useNavigate()
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
  const username = localStorage.getItem('username') || 'there'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!authToken) {
      setShowLoginPrompt(true)
      return
    }

    const formData = new FormData(event.currentTarget)
    const job = Object.fromEntries(formData.entries())
    job.company = job.company.trim()
    job.hiring_start = job.hiring_start || null
    job.hiring_end = job.hiring_end || null

    if (job.hiring_start && job.hiring_end && job.hiring_end < job.hiring_start) {
      setError('The hiring end date must be on or after the start date.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/jobs/create', job, {
        headers: { Authorization: `Token ${authToken}` },
      })

      navigate('/companies', { state: { message: 'Your job was posted successfully.' } })
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        setAuthToken(null)
        setShowLoginPrompt(true)
        return
      }

      const data = requestError.response?.data
      const message = data && typeof data === 'object'
        ? Object.entries(data).map(([field, messages]) => {
          const detail = Array.isArray(messages) ? messages.join(', ') : String(messages)
          return `${field}: ${detail}`
        }).join(' ')
        : 'Could not post this job.'
      setError(message || 'Could not post this job. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'
  const labelClass = 'block text-sm font-medium text-slate-700'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight text-blue-700">
            JobPortal<span className="text-blue-400">.</span>
          </NavLink>
          <nav className="flex items-center gap-5 text-sm font-medium sm:gap-6">
            <NavLink to="/job" className="text-slate-500 transition hover:text-blue-700">Find jobs</NavLink>
            <NavLink to="/companies" className="text-slate-500 transition hover:text-blue-700">Companies</NavLink>
            <NavLink to="/services" className="text-blue-700">Services</NavLink>
          </nav>
          {authToken ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:block">Hello, {username}</span>
              <ProfilePage />
            </div>
          ) : (
            <NavLink to="/login" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Back to login
            </NavLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:py-12">
        <NavLink to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline">
          ← Back to services
        </NavLink>

        <div className="mb-7 mt-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">For employers</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Post a job opening</h1>
          <p className="mt-2 text-slate-500">Add the role and hiring details candidates need to make an informed decision.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <section>
            <h2 className="text-lg font-bold">Company and role</h2>
            <p className="mt-1 text-sm text-slate-500">Use an existing company name to group this role with its other openings.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Company name <span className="text-rose-600">*</span>
                <input className={fieldClass} name="company" maxLength="150" placeholder="e.g. Northstar Labs" required />
              </label>
              <label className={labelClass}>
                Job title <span className="text-rose-600">*</span>
                <input className={fieldClass} name="title" maxLength="200" placeholder="e.g. Product Designer" required />
              </label>
              <label className={labelClass}>
                Location <span className="text-rose-600">*</span>
                <input className={fieldClass} name="location" maxLength="100" placeholder="City, region, or Remote" required />
              </label>
              <label className={labelClass}>
                Employment type <span className="text-rose-600">*</span>
                <select className={fieldClass} name="employment_type" defaultValue="full_time" required>
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Job description <span className="text-rose-600">*</span>
                <textarea className={fieldClass} name="description" rows="4" placeholder="Describe the role and its responsibilities" required />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-7">
            <h2 className="text-lg font-bold">Compensation and hiring period</h2>
            <p className="mt-1 text-sm text-slate-500">Hiring dates determine whether the role is shown as open, upcoming, or closed.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Salary or pay range
                <input className={fieldClass} name="salary_range" maxLength="50" placeholder="e.g. $70k–$90k / year" />
              </label>
              <div className="hidden sm:block" />
              <label className={labelClass}>
                Hiring starts
                <input className={fieldClass} name="hiring_start" type="date" />
              </label>
              <label className={labelClass}>
                Hiring ends
                <input className={fieldClass} name="hiring_end" type="date" />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-7">
            <h2 className="text-lg font-bold">Candidate details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Eligibility
                <textarea className={fieldClass} name="eligibility" rows="3" placeholder="Experience, education, work authorization, or other criteria" />
              </label>
              <label className={labelClass}>
                Requirements
                <textarea className={fieldClass} name="requirements" rows="3" placeholder="Skills, qualifications, or certifications" />
              </label>
            </div>
          </section>

          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <NavLink to="/services" className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Cancel
            </NavLink>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Publishing…' : 'Publish job'}
            </button>
          </div>
        </form>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5 text-center text-sm text-slate-400">
          © 2026 JobPortal. All rights reserved.
        </div>
      </footer>
      <LoginPrompt
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="Please log in before publishing a job. You can keep browsing this form without an account."
      />
    </div>
  )
}

export default UploadJobPage