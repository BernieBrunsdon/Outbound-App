import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Do not restore sessions from localStorage: every full load shows the login screen first.
    // (Avoids marketing "Client login" links opening the last SDR dashboard by mistake.)
    try {
      localStorage.removeItem('sdr_user')
    } catch {
      /* ignore */
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    // Intentionally no localStorage: session lasts until refresh or logout only.
  }

  const handleLogout = () => {
    setUser(null)
    try {
      localStorage.removeItem('sdr_user')
    } catch {
      /* ignore */
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-primary-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <AppProvider user={user}>
      <Dashboard user={user} onLogout={handleLogout} />
    </AppProvider>
  )
}

export default App

