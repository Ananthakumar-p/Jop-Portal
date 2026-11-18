import { NavLink, useLocation } from 'react-router-dom'

function HomePage() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-4">
          <NavLink to="/" className="text-xl font-extrabold tracking-tight text-blue-700">
            JobPortal<span className="text-blue-400">.</span>
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700 px-6 py-12 text-white shadow-xl shadow-blue-900/10 sm:px-12 sm:py-20">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
              Your next opportunity starts here
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Find work that moves you forward.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
              Explore job opportunities, discover companies that are hiring, and keep your applications organized in one place.
            </p>
            <NavLink
              to="/login"
              state={{ from: location }}
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              Log in to get started
              <span className="ml-2" aria-hidden="true">→</span>
            </NavLink>
          </div>
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-72 w-72 rounded-full border-40 border-white/10" />
          <div aria-hidden="true" className="absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: 'Explore opportunities',
              description: 'Browse job listings and find roles that fit your goals.',
            },
            {
              title: 'Discover companies',
              description: 'Learn about employers and the positions they are hiring for.',
            },
            {
              title: 'Track applications',
              description: 'Keep up with the progress of the jobs you have applied to.',
            },
          ].map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
            </article>
          ))}
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

export default HomePage