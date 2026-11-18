import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import LogoutButton from './LogoutButton'
import api from './api'

function ProfilePage() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const username = localStorage.getItem('username') || 'there'
  const initials = username.slice(0, 2).toUpperCase()

  function clearLogin() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    setAuthToken(null)
  }

  function toggleProfile() {
    const shouldOpen = !isOpen
    setIsOpen(shouldOpen)
    if (shouldOpen && authToken) {
      setIsLoading(true)
      setError('')
      setMessage('')
    }
  }

  useEffect(() => {
    if (!isOpen || !authToken) return undefined

    const controller = new AbortController()

    async function loadProfile() {
      try {
        const { data } = await api.get('/profile', {
          headers: { Authorization: `Token ${authToken}` },
          signal: controller.signal,
        })
        setProfile(data)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          if (requestError.response?.status === 401) {
            clearLogin()
            setError('Your login expired. Please sign in again.')
          } else {
            setError(requestError.response?.data?.detail || 'Could not load your profile.')
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()
    return () => controller.abort()
  }, [authToken, isOpen])

  async function handleResumeUpload(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setError('')
    setMessage('')
    setIsUploading(true)

    try {
      const { data } = await api.post('/profile/resume', formData, {
        headers: { Authorization: `Token ${authToken}` },
      })

      setProfile((currentProfile) => ({ ...currentProfile, ...data }))
      setMessage(data.message)
      form.reset()
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearLogin()
        setError('Your login expired. Please sign in again.')
      } else {
        const data = requestError.response?.data
        const detail = data?.resume
        setError(Array.isArray(detail)
          ? detail.join(', ')
          : detail || data?.detail || 'Could not upload your resume.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  async function handleResumeDownload() {
    setError('')
    setIsDownloading(true)
    try {
      const { data } = await api.get('/profile/resume', {
        headers: { Authorization: `Token ${authToken}` },
        responseType: 'blob',
      })

      const fileUrl = URL.createObjectURL(data)
      const downloadLink = document.createElement('a')
      downloadLink.href = fileUrl
      downloadLink.download = profile.resume_name
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearLogin()
        setError('Your login expired. Please sign in again.')
      } else {
        setError(requestError.response?.data?.detail || 'Could not download your resume.')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  function formatDate(value) {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleProfile}
        aria-label={`Open ${username}'s profile`}
        aria-expanded={isOpen}
        aria-controls="profile-panel"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 transition hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close profile panel"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/30"
          />
          <aside
            id="profile-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-panel-title"
            className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-slate-200 bg-slate-50 shadow-2xl md:w-[30vw] md:min-w-[280px] lg:max-w-[480px]"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h2 id="profile-panel-title" className="truncate font-bold text-slate-900">
                    {profile?.username || username}
                  </h2>
                  <p className="truncate text-xs text-slate-500">{profile?.email || 'Your JobPortal profile'}</p>
                </div>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-3">
                {authToken && <LogoutButton />}
                <button
                  type="button"
                  aria-label="Close profile panel"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  ×
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {!authToken ? (
                <section className="rounded-xl border border-slate-200 bg-white p-5 text-center">
                  <h3 className="font-semibold text-slate-900">Sign in to view your profile</h3>
                  <p className="mt-2 text-sm text-slate-500">Your account, resume, and notifications are private.</p>
                  <NavLink
                    to="/login"
                    state={{ from: location }}
                    onClick={() => setIsOpen(false)}
                    className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Go to login
                  </NavLink>
                </section>
              ) : isLoading ? (
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  Loading your profile…
                </p>
              ) : (
                <div className="space-y-4">
                  {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

                  <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-bold text-slate-900">Account details</h3>
                    <dl className="mt-4 space-y-3">
                      <div>
                        <dt className="text-xs font-medium text-slate-500">Username</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{profile?.username || username}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500">Email address</dt>
                        <dd className="mt-1 break-all text-sm font-semibold text-slate-800">{profile?.email || 'No email address provided'}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Resume</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">PDF, DOC, or DOCX · up to 5 MB</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">Private</span>
                    </div>
                    {profile?.resume_name && (
                      <div className="mt-4 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 p-3">
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{profile.resume_name}</span>
                        <button
                          type="button"
                          onClick={handleResumeDownload}
                          disabled={isDownloading}
                          className="shrink-0 text-xs font-semibold text-blue-700 hover:underline disabled:opacity-60"
                        >
                          {isDownloading ? 'Downloading…' : 'Download'}
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleResumeUpload} className="mt-4 space-y-3">
                      <input
                        name="resume"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        required
                        className="block w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUploading ? 'Uploading…' : profile?.resume_name ? 'Replace resume' : 'Upload resume'}
                      </button>
                    </form>
                    {message && <p role="status" className="mt-3 text-xs text-emerald-700">{message}</p>}
                  </section>

                  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                          <p className="mt-1 text-xs text-slate-500">Company shortlist updates</p>
                        </div>
                        {profile?.notifications?.length > 0 && (
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {profile.notifications.length}
                          </span>
                        )}
                      </div>
                    </div>
                    {profile?.notifications?.length ? (
                      <div className="divide-y divide-slate-100">
                        {profile.notifications.map((notification) => (
                          <article key={notification.id} className="flex gap-3 p-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm text-violet-700" aria-hidden="true">★</span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900">You’ve been shortlisted!</h4>
                              <p className="mt-1 text-xs leading-5 text-slate-600">
                                {notification.company} shortlisted you for <span className="font-medium">{notification.job_title}</span>.
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">Applied {formatDate(notification.applied_on)}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="p-5 text-xs leading-5 text-slate-500">
                        No shortlist updates yet. Companies’ updates to your applications will appear here.
                      </p>
                    )}
                    <div className="border-t border-slate-100 p-4">
                      <NavLink
                        to="/applications"
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-blue-700 hover:underline"
                      >
                        View all applications →
                      </NavLink>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

export default ProfilePage
