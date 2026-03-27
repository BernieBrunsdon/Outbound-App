import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { DEMO_USERS } from '../utils/constants'
import brandLogo from '../assets/outbound-growth-logo.png'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const user = DEMO_USERS.find(
      u => u.email === email && u.password === password
    )

    if (user) {
      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'sdr',
      })
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={brandLogo}
            alt="Outbound Growth"
            className="w-full max-w-xs mx-auto mb-4 rounded-xl border border-gray-100 shadow-sm"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDR Activity Tracker
          </h1>
          <p className="text-gray-600">Sign in to track your sales activity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="alex@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="demo123"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Demo credentials: Use any SDR email (alex@company.com, etc.) with password "demo123"<br />
            Admin: admin@company.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

