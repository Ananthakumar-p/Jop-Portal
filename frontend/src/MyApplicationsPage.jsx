import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ProfilePage from './ProfilePage'

function MyApplicationsPage() {
  const location = useLocation()
  const [applications, setApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('authToken')))
  const [error, setError] = useState('')
  const authToken = localStorage.getItem('authToken')
  const username = localStorage.getItem('username') || 'there'

  useEffect(() => {
    if (!authToken) {
      return
    }

    const controller = new AbortController()

    async function loadApplications() {
      try {
        const response = await fetch('http://127.0.0.1:8000/applications', {
          headers: { Authorization: `Token ${authToken}` },
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Could not load your applications. Please try again.')
        }
        setApplications(await response.json())
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

    loadApplications()
    return () => controller.abort()
  }, [authToken])

  const counts = useMemo(() => applications.reduce((result, application) => {
    const status = (application.status || 'pending').toLowerCase()
    result.all += 1
    result[status] = (result[status] || 0) + 1
    return result
  }, { all: 0 }), [applications])

  const filteredApplications = useMemo(() => applications.filter((application) => {
    const status = (application.status || 'pending').toLowerCase()
    const job = application.job || {}
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [job.title, job.company, job.location]
      .some((value) => value?.toLowerCase().includes(query))
    return matchesStatus && matchesSearch
  }), [applications, search, statusFilter])

  const filters = [
    { value: 'all', label: 'All applications' },
    { value: 'pending', label: 'In review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Not selected' },
    { value: 'hired', label: 'Hired' },
  ]

  function formatDate(value) {
    if (!value) return 'Date unavailable'
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function statusLabel(status) {
    const labels = {
      pending: 'In review',
      shortlisted: 'Shortlisted',
      rejected: 'Not selected',
      hired: 'Hired',
    }
    return labels[(status || 'pending').toLowerCase()] || status
  }

  function statusStyle(status) {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 ring-amber-200',
      shortlisted: 'bg-violet-50 text-violet-700 ring-violet-200',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
      hired: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    }
    return styles[(status || 'pending').toLowerCase()] || 'bg-slate-100 text-slate-700 ring-slate-200'
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight text-blue-700">
            JobPortal<span className="text-blue-400">.</span>
          </NavLink>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-gray-700 sm:gap-6">
            <NavLink to="/job" className="hover:text-blue-700">Jobs</NavLink>
            <NavLink to="/companies" className="hover:text-blue-700">Companies</NavLink>
            <NavLink to="/applications" className="text-blue-700">My Applications</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {authToken ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:block">Hello, {username}</span>
                <ProfilePage />
              </>
            ) : (
              <NavLink to="/login" state={{ from: location }} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                Back to login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Your job search</p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My applications</h1>
              <p className="mt-2 text-slate-500">Keep track of the opportunities you’ve applied for.</p>
            </div>
            <NavLink
              to="/job"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <span aria-hidden="true">＋</span> Find more jobs
            </NavLink>
          </div>
        </div>

        <section aria-label="Application summary" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total applications', value: counts.all, color: 'text-blue-700' },
            { label: 'In review', value: counts.pending || 0, color: 'text-amber-600' },
            { label: 'Shortlisted', value: counts.shortlisted || 0, color: 'text-violet-600' },
            { label: 'Hired', value: counts.hired || 0, color: 'text-emerald-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`mt-2 text-3xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-bold">Applications</h2>
                <p className="mt-1 text-sm text-slate-500">Review the status of each application.</p>
              </div>
              <label className="relative block w-full md:max-w-xs">
                <span className="sr-only">Search applications</span>
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
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    statusFilter === filter.value
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                  {filter.value === 'all' ? ` (${counts.all})` : counts[filter.value] ? ` (${counts[filter.value]})` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">Loading your applications…</div>
            ) : error ? (
              <div role="alert" className="p-10 text-center">
                <p className="font-semibold text-rose-700">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">
                  Try again
                </button>
              </div>
            ) : !authToken ? (
              <div className="p-10 text-center">
                <h3 className="font-semibold">Sign in to see your applications</h3>
                <p className="mt-2 text-sm text-slate-500">Your applications will appear here after you log in.</p>
                <NavLink to="/login" state={{ from: location }} className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline">
                  Go to login
                </NavLink>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700" aria-hidden="true">↗</div>
                <h3 className="mt-4 font-semibold">
                  {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  {applications.length === 0
                    ? 'When you apply for a job, you’ll be able to follow its progress here.'
                    : 'Try a different search or status filter.'}
                </p>
                {applications.length === 0 && (
                  <NavLink to="/job" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline">
                    Browse open jobs →
                  </NavLink>
                )}
              </div>
            ) : filteredApplications.map((application) => {
              const job = application.job || {}
              const companyInitial = (job.company || 'J').slice(0, 1).toUpperCase()
              return (
                <article key={application.id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                      {companyInitial}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">{job.title || 'Job title unavailable'}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-600">{job.company || 'Company unavailable'}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {job.location && <span>⌖ {job.location}</span>}
                        {job.salary_range && <span>{job.salary_range}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:justify-end sm:border-0 sm:pt-0">
                    <div className="sm:text-right">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle(application.status)}`}>
                        {statusLabel(application.status)}
                      </span>
                      <p className="mt-2 text-xs text-slate-500">Applied {formatDate(application.applied_on)}</p>
                    </div>
                    {job.id && (
                      <NavLink
                        to={`/apply/${job.id}`}
                        className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        View job
                      </NavLink>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
          {!loading && !error && authToken && filteredApplications.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:px-6">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          )}
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

export default MyApplicationsPage