import { useApp } from '../context/AppContext'
import Sidebar from './Sidebar'
import SDRView from './SDRView'
import ClientView from './ClientView'
import AdminTeamOverview from './AdminTeamOverview'

const Dashboard = ({ user, onLogout }) => {
  const { firestoreError } = useApp()

  return (
    <div className="h-screen bg-slate-50 overflow-hidden">
      <div className="flex h-full overflow-hidden">
        <Sidebar user={user} onLogout={onLogout} />

        <main className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 md:p-8">
            {firestoreError && (
              <div
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                <strong>Firestore:</strong> {firestoreError}
              </div>
            )}
            {user.role === 'admin' && <AdminTeamOverview />}
            {user.role === 'sdr' && <SDRView sdrId={user.id} />}
            {user.role === 'client' && <ClientView />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
