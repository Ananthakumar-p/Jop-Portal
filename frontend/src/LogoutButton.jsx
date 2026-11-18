import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'

function LogoutButton() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogout() {
    setError('')
    const token = localStorage.getItem('authToken')

    try {
      if (token) {
        try {
          await api.post('/logout', null, {
            headers: { Authorization: `Token ${token}` },
          })
        } catch (requestError) {
          if (requestError.response?.status !== 401) {
          setError('Could not sign out. Please try again.')
          return
          }
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
