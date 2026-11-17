import { NavLink } from 'react-router-dom'

function LoginPrompt({ open, onClose, message = 'Please log in to continue.' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-700" aria-hidden="true">
          !
        </div>
        <h2 id="login-prompt-title" className="mt-4 text-xl font-bold text-slate-900">
          Login required
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Keep browsing
          </button>
          <NavLink
            to="/login"
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Log in to continue
          </NavLink>
        </div>
      </section>
    </div>
  )
}

export default LoginPrompt
