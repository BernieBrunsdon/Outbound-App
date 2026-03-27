import { Home, LogOut, BarChart3 } from 'lucide-react'
import { SDRS } from '../utils/constants'
import brandLogo from '../assets/outbound-growth-logo-clean.png'

const Sidebar = ({ user, selectedSDR, onSelectSDR, viewMode, onViewModeChange, onLogout }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <img
          src={brandLogo}
          alt="Outbound Growth"
          className="w-full h-auto mb-4"
        />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">SDR Tracker</h2>
            <p className="text-xs text-gray-500">{user.name}</p>
          </div>
        </div>
        {user.role === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('individual')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'individual'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => onViewModeChange('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All SDRs
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {user.role === 'admin' && viewMode === 'individual' ? (
          <div className="space-y-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              SDRs
            </div>
            {SDRS.map((sdr) => (
              <button
                key={sdr.id}
                onClick={() => onSelectSDR(sdr.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  selectedSDR === sdr.id
                    ? 'bg-primary-50 text-primary-700 border-2 border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${sdr.color}`} />
                <span className="font-medium">{sdr.name}</span>
              </button>
            ))}
          </div>
        ) : user.role === 'sdr' ? (
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 text-primary-700 border-2 border-primary-200"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">My Stats</span>
            </button>
          </div>
        ) : null}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

