import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ProfilePage from './ProfilePage'

const employmentLabels = {
  full_time: 'Full time',
  part_time: 'Part time',
  internship: 'Internship',
  freelance: 'Freelance',
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function JobListPage() {
  const location = useLocation()
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const username = localStorage.getItem('username') || 'there'
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))

  useEffect(() => {
    const controller = new AbortController()

    async function loadJobs() {
      try {
        const response = await fetch('http://127.0.0.1:8000/jobs', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Could not load jobs. Please try again.')
        }
        setJobs(await response.json())
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadJobs()
    return () => controller.abort()
  }, [])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return jobs
    return jobs.filter((job) => [job.title, job.company, job.location, job.description]
      .some((value) => value?.toLowerCase().includes(query)))
  }, [jobs, search])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight text-blue-700">
            JobPortal<span className="text-blue-400">.</span>
          </NavLink>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium sm:gap-6">
            <NavLink to="/job" className="text-blue-700">Jobs</NavLink>
            <NavLink to="/companies" className="text-slate-500 transition hover:text-blue-700">Companies</NavLink>
            <NavLink to="/applications" className="text-slate-500 transition hover:text-blue-700">
              My Applications
            </NavLink>
          </nav>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:block">Hello, {username}</span>
              <ProfilePage />
            </div>
          ) : (
            <NavLink to="/login" state={{ from: location }} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
              Back to login
            </NavLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Explore opportunities</p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your next job</h1>
              <p className="mt-2 text-slate-500">Discover roles from companies looking for their next great hire.</p>
            </div>
            <NavLink
              to="/companies"
              className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              Explore companies <span className="ml-2" aria-hidden="true">→</span>
            </NavLink>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Recommended jobs</h2>
              <p className="mt-1 text-sm text-slate-500">
                {jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'} to explore
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">Search jobs</span>
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, company, location"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </label>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading jobs…</p>
            ) : error ? (
              <div role="alert" className="py-10 text-center">
                <p className="font-semibold text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700" aria-hidden="true">⌕</div>
                <h3 className="mt-4 font-semibold">
                  {jobs.length ? 'No matching jobs' : 'No jobs available yet'}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  {jobs.length
                    ? 'Try another search term.'
                    : 'New job opportunities will appear here when companies post them.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredJobs.map((job) => (
                  <article
                    key={job.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                        {(job.company || 'J').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-600">{job.company}</p>
                        <p className="mt-1 text-xs text-slate-400">Posted {formatDate(job.posted_on)}</p>
                      </div>
                    </div>

                    {job.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                      {job.location && (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1.5">⌖ {job.location}</span>
                      )}
                      <span className="rounded-md bg-slate-100 px-2.5 py-1.5">
                        {job.salary_range || 'Salary not listed'}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1.5">
                        {employmentLabels[job.employment_type] || 'Employment type not specified'}
                      </span>
                    </div>

                    <div className="mt-auto flex justify-end pt-5">
                      <NavLink
                        to={`/apply/${job.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        View details <span aria-hidden="true">→</span>
                      </NavLink>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-5 text-center text-sm text-slate-400">
          © 2026 JobPortal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default JobListPage
