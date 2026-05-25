import { useState } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { LogIn } from 'lucide-react'
import { DEMO_USERS } from '../utils/constants'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import brandLogo from '../assets/outbound-growth-logo-clean.png'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = DEMO_USERS.find(
        (u) => u.email === email && u.password === password && u.role !== 'client'
      )

      if (!user) {
        setError('Invalid email or password')
        return
      }

      if (isFirebaseConfigured) {
        try {
          await signInAnonymously(auth)
        } catch (authErr) {
          // Anonymous may be disabled; demo Firestore rules still allow reads when open.
          if (authErr?.code !== 'auth/configuration-not-found') {
            throw authErr
          }
          console.warn('[Login] Anonymous auth not enabled; continuing with Firestore demo rules.')
        }
      }

      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'sdr',
      })
    } catch (err) {
      console.error('[Login] Sign-in failed', err)
      setError('Could not connect to the database. Check Firebase config and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={brandLogo}
            alt="Outbound Growth"
            className="w-full max-w-xs h-auto mx-auto mb-4"
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
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn className="w-5 h-5" />
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default Login

