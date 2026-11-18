import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ProfilePage from './ProfilePage'
import api from './api'

const employmentLabels = {
  full_time: 'Full time',
  part_time: 'Part time',
  internship: 'Internship',
  freelance: 'Freelance',
}

function getToday() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getJobStatus(job, today) {
  const start = job.hiring_start || ''
  const end = job.hiring_end || ''
  const hasPeriod = Boolean(start || end)

  if (hasPeriod && (!start || start <= today) && (!end || end >= today)) {
    return 'hiring'
  }
  if (start && start > today) {
    return 'upcoming'
  }
  return 'closed'
}

function getCompanyStatus(company, today) {
  const statuses = (company.jobs || []).map((job) => getJobStatus(job, today))
  if (statuses.includes('hiring')) return 'hiring'
  if (statuses.includes('upcoming')) return 'upcoming'
  return 'closed'
}

function statusDetails(status) {
  const details = {
    hiring: {
      label: 'Hiring now',
      style: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      dot: 'bg-emerald-500',
    },
    upcoming: {
      label: 'Hiring soon',
      style: 'bg-amber-50 text-amber-700 ring-amber-200',
      dot: 'bg-amber-500',
    },
    closed: {
      label: 'Not hiring',
      style: 'bg-slate-100 text-slate-600 ring-slate-200',
      dot: 'bg-slate-400',
    },
  }
  return details[status]
}

function periodLabel(job) {
  const start = formatDate(job.hiring_start)
  const end = formatDate(job.hiring_end)
  if (start && end) return `${start} – ${end}`
  if (start) return `From ${start}`
  if (end) return `Until ${end}`
  return 'Hiring period not announced'
}

function CompaniesPage() {
  const location = useLocation()
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))
  const today = getToday()
  const username = localStorage.getItem('username') || 'there'

  useEffect(() => {
    const controller = new AbortController()

    async function loadCompanies() {
      try {
        const { data } = await api.get('/companies', { signal: controller.signal })
        setCompanies(data)
      } catch {
        if (!controller.signal.aborted) {
          setError('Could not load companies. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCompanies()
    return () => controller.abort()
  }, [])

  const counts = useMemo(() => companies.reduce((result, company) => {
    result[getCompanyStatus(company, today)] += 1
    return result
  }, { hiring: 0, upcoming: 0, closed: 0 }), [companies, today])

  const filteredCompanies = useMemo(() => companies.filter((company) => {
    const status = getCompanyStatus(company, today)
    if (statusFilter !== 'all' && status !== statusFilter) return false
    const query = search.trim().toLowerCase()
    if (!query) return true

    const searchableText = [
      company.name,
      ...(company.jobs || []).flatMap((job) => [
        job.title,
        job.location,
        job.eligibility,
        job.requirements,
        job.employment_type,
      ]),
    ].filter(Boolean).join(' ').toLowerCase()

    return searchableText.includes(query)
  }), [companies, search, statusFilter, today])

  const filters = [
    { value: 'all', label: 'All companies', count: companies.length },
    { value: 'hiring', label: 'Hiring now', count: counts.hiring },
    { value: 'upcoming', label: 'Hiring soon', count: counts.upcoming },
    { value: 'closed', label: 'Not hiring', count: counts.closed },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight text-blue-700">
            JobPortal<span className="text-blue-400">.</span>
          </NavLink>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium sm:gap-6">
            <NavLink to="/job" className="text-slate-500 transition hover:text-blue-700">Jobs</NavLink>
            <NavLink to="/companies" className="text-blue-700">Companies</NavLink>
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
            <NavLink to="/login" state={{ from: location }} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Back to login
            </NavLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        {location.state?.message && (
          <p role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {location.state.message}
          </p>
        )}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Explore employers</p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Companies hiring now</h1>
              <p className="mt-2 max-w-2xl text-slate-500">
                Explore companies, open roles, requirements, and when each hiring period runs.
              </p>
            </div>
            <NavLink
              to="/job"
              className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              Browse all jobs <span className="ml-2" aria-hidden="true">→</span>
            </NavLink>
          </div>
        </div>

        <section aria-label="Company hiring summary" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Companies listed', value: companies.length, color: 'text-blue-700' },
            { label: 'Hiring now', value: counts.hiring, color: 'text-emerald-600' },
            { label: 'Hiring soon', value: counts.upcoming, color: 'text-amber-600' },
            { label: 'Not hiring', value: counts.closed, color: 'text-slate-600' },
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
                <h2 className="text-lg font-bold">Company directory</h2>
                <p className="mt-1 text-sm text-slate-500">Hiring status is based on the dates listed for each role.</p>
              </div>
              <label className="relative block w-full md:max-w-sm">
                <span className="sr-only">Search companies and jobs</span>
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search companies, roles, skills"
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
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">Loading companies…</div>
            ) : error ? (
              <div role="alert" className="p-10 text-center">
                <p className="font-semibold text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700" aria-hidden="true">⌕</div>
                <h3 className="mt-4 font-semibold">
                  {companies.length ? 'No matching companies' : 'No companies listed yet'}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  {companies.length
                    ? 'Try another search or hiring status filter.'
                    : 'Companies and their open roles will appear here when they are added.'}
                </p>
              </div>
            ) : filteredCompanies.map((company) => {
              const status = getCompanyStatus(company, today)
              const companyStatus = statusDetails(status)
              const jobs = company.jobs || []
              const locations = [...new Set(jobs.map((job) => job.location?.trim()).filter(Boolean))]

              return (
                <article key={company.id} className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                        {(company.name || 'C').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">{company.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {jobs.length} {jobs.length === 1 ? 'role' : 'roles'} listed
                        </p>
                        {locations.length > 0 && (
                          <p className="mt-1 text-sm text-slate-500">
                            Locations: {locations.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${companyStatus.style}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${companyStatus.dot}`} />
                      {companyStatus.label}
                    </span>
                  </div>

                  {jobs.length === 0 ? (
                    <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No roles have been added for this company yet.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {jobs.map((job) => {
                        const jobStatus = getJobStatus(job, today)
                        const jobStatusInfo = statusDetails(jobStatus)
                        return (
                          <section key={job.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-slate-900">{job.title}</h4>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${jobStatusInfo.style}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${jobStatusInfo.dot}`} />
                                    {jobStatusInfo.label}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                                  {job.location && <span className="rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">⌖ {job.location}</span>}
                                  <span className="rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                                    {employmentLabels[job.employment_type] || 'Employment type not specified'}
                                  </span>
                                  <span className="rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                                    {job.salary_range || 'Salary not listed'}
                                  </span>
                                  <span className="rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                                    {periodLabel(job)}
                                  </span>
                                </div>
                                {(job.eligibility || job.requirements) && (
                                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                    {job.eligibility && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Eligibility</p>
                                        <p className="mt-1 whitespace-pre-line text-slate-700">{job.eligibility}</p>
                                      </div>
                                    )}
                                    {job.requirements && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p>
                                        <p className="mt-1 whitespace-pre-line text-slate-700">{job.requirements}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {job.id && (
                                <NavLink
                                  to={`/apply/${job.id}`}
                                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                                >
                                  View role <span className="ml-2" aria-hidden="true">→</span>
                                </NavLink>
                              )}
                            </div>
                          </section>
                        )
                      })}
                    </div>
                  )}
                </article>
              )
            })}
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

export default CompaniesPage
