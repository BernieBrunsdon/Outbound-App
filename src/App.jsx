import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { loadDataFromStorage, saveDataToStorage } from './utils/storage'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('sdr_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('sdr_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('sdr_user')
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
    <AppProvider>
      <Dashboard user={user} onLogout={handleLogout} />
    </AppProvider>
  )
}

export default App

