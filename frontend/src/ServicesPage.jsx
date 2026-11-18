import { NavLink } from 'react-router-dom'
import ProfilePage from './ProfilePage'

function ServicesPage() {
  const username = localStorage.getItem('username') || 'there'
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))

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
            <NavLink to="/applications" className="hidden text-slate-500 transition hover:text-blue-700 sm:block">My applications</NavLink>
          </nav>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <ProfilePage />
            </div>
          ) : (
            <NavLink to="/login" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Back to login
            </NavLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700 px-6 py-10 text-white shadow-xl shadow-blue-900/10 sm:px-10 sm:py-14">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Your next step starts here</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Welcome, {username}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Looking for your next opportunity or ready to find great talent? Choose a service to get started.
            </p>
          </div>
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
          <div aria-hidden="true" className="absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold">How can we help?</h2>
            <p className="mt-1 text-sm text-slate-500">Choose the service that fits what you need today.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <NavLink
              to="/job"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700 transition group-hover:bg-blue-100" aria-hidden="true">
                ↗
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">For job seekers</p>
              <h3 className="mt-2 text-2xl font-bold">Find and apply for jobs</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Browse current openings, explore hiring companies, and submit applications for roles that fit you.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Explore available jobs <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </span>
            </NavLink>

            <NavLink
              to="/upload-job"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-700 transition group-hover:bg-violet-100" aria-hidden="true">
                +
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-violet-700">For employers</p>
              <h3 className="mt-2 text-2xl font-bold">Post a job opening</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Share a role’s details, requirements, compensation, and hiring dates with candidates.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
                Create a job listing <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </span>
            </NavLink>
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

export default ServicesPage
