import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LogoutButton() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogout() {
    setError('')
    const token = localStorage.getItem('authToken')

    try {
      if (token) {
        const response = await fetch('http://127.0.0.1:8000/logout', {
          method: 'POST',
          headers: { Authorization: `Token ${token}` },
        })
        if (!response.ok && response.status !== 401) {
          throw new Error('Could not sign out. Please try again.')
        }
      }

      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Could not sign out. Please try again.')
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-semibold text-slate-500 transition hover:text-rose-600"
      >
        Log out
      </button>
      {error && <span role="alert" className="mt-1 text-xs text-rose-600">{error}</span>}
    </div>
  )
}

export default LogoutButton
