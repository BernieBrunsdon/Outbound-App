import { Home, LogOut, BarChart3, LayoutDashboard } from 'lucide-react'
import { SDRS } from '../utils/constants'
import brandLogo from '../assets/outbound-growth-logo-clean.png'

const Sidebar = ({ user, onLogout }) => {
  const isAdmin = user.role === 'admin'
  const isSdr = user.role === 'sdr'
  const isClient = user.role === 'client'

  const sdr = SDRS.find((s) => s.id === user.id)

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <img
          src={brandLogo}
          alt="Outbound Growth"
          className="w-full h-auto mb-4"
        />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">OG Pulse</h2>
            <p className="text-xs text-gray-500">{user.name}</p>
          </div>
        </div>
        {isAdmin && (
          <p className="text-xs text-ink-muted leading-relaxed">
            Internal ops — team performance only. Clients and reps use the live dashboard.
          </p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {isSdr && (
          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 text-primary-700 border-2 border-primary-200"
            >
              <Home className="w-5 h-5 shrink-0" aria-hidden />
              <span className="font-medium text-left">My dashboard</span>
            </button>
            {sdr?.accountName && (
              <p className="px-4 text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold text-gray-600">Account: </span>
                {sdr.accountName}
              </p>
            )}
          </div>
        )}
        {isClient && (
          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 text-primary-700 border-2 border-primary-200"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden />
              <span className="font-medium text-left">Your dashboard</span>
            </button>
            <p className="px-4 text-xs text-gray-500 leading-relaxed">
              Same view as your live programme: performance, channel mix, and meeting vault.
            </p>
          </div>
        )}
        {isAdmin && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden />
              <span className="font-medium">Team overview</span>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <LogOut className="w-5 h-5" aria-hidden />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
