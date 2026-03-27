import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SDRS } from '../utils/constants'
import SDRView from './SDRView'
import AdminAllView from './AdminAllView'
import { Calendar } from 'lucide-react'

const AdminView = ({ selectedSDR, viewMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  if (viewMode === 'all') {
    return <AdminAllView selectedDate={selectedDate} onDateChange={setSelectedDate} />
  }

  if (!selectedSDR) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select an SDR</h2>
          <p className="text-gray-600">Choose an SDR from the sidebar to view their activity</p>
        </div>
      </div>
    )
  }

  return <SDRView sdrId={selectedSDR} />
}

export default AdminView

