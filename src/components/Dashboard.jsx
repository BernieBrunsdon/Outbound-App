import { useState } from 'react'
import Sidebar from './Sidebar'
import SDRView from './SDRView'
import AdminView from './AdminView'
import { LogOut } from 'lucide-react'

const Dashboard = ({ user, onLogout }) => {
  const [selectedSDR, setSelectedSDR] = useState(user.role === 'admin' ? null : user.id)
  const [viewMode, setViewMode] = useState('individual') // 'individual' or 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          user={user}
          selectedSDR={selectedSDR}
          onSelectSDR={setSelectedSDR}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onLogout={onLogout}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {user.role === 'admin' ? (
              <AdminView
                selectedSDR={selectedSDR}
                viewMode={viewMode}
              />
            ) : (
              <SDRView sdrId={user.id} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

