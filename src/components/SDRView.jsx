import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SDRS } from '../utils/constants'
import ActivityForm from './ActivityForm'
import TotalsCard from './TotalsCard'
import Charts from './Charts'
import MeetingVault from './MeetingVault'
import { Calendar, TrendingUp } from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'

const SDRView = ({ sdrId }) => {
  // Activities + bookings come from Firestore via AppContext onSnapshot (not browser-only memory).
  const { getActivitiesBySDR, getRecentBookingsForSDR } = useApp()
  const [timeView, setTimeView] = useState('daily') // 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const sdr = SDRS.find(s => s.id === sdrId)
  const allActivities = getActivitiesBySDR(sdrId)

  // Filter activities based on time view
  const getFilteredActivities = () => {
    if (timeView === 'daily') {
      return allActivities.filter(a => a.date === selectedDate)
    } else if (timeView === 'weekly') {
      const selected = parseISO(selectedDate)
      const weekStart = startOfWeek(selected, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selected, { weekStartsOn: 1 })
      return allActivities.filter(a => {
        const activityDate = parseISO(a.date)
        return isWithinInterval(activityDate, { start: weekStart, end: weekEnd })
      })
    } else {
      const selected = parseISO(selectedDate)
      const monthStart = startOfMonth(selected)
      const monthEnd = endOfMonth(selected)
      return allActivities.filter(a => {
        const activityDate = parseISO(a.date)
        return isWithinInterval(activityDate, { start: monthStart, end: monthEnd })
      })
    }
  }

  const filteredActivities = getFilteredActivities()
  const recentBookings = getRecentBookingsForSDR(sdrId, 10)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 ${sdr.color} rounded-2xl flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">
              {sdr.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{sdr.name}</h1>
            <p className="text-gray-600">{sdr.email}</p>
          </div>
        </div>

        {/* Time View Toggle */}
        <div className="flex items-center gap-4 bg-white rounded-xl p-2 shadow-sm inline-flex">
          <Calendar className="w-5 h-5 text-gray-500 ml-2" />
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((view) => (
              <button
                key={view}
                onClick={() => setTimeView(view)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeView === view
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Activity Form */}
      <div className="mb-8">
        <ActivityForm
          sdrId={sdrId}
          date={selectedDate}
          timeView={timeView}
        />
      </div>

      {/* Totals */}
      <div className="mb-8">
        <TotalsCard activities={filteredActivities} timeView={timeView} />
      </div>

      {/* Charts: allActivities is this SDR's rows synced from Firestore */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performance Charts</h2>
        </div>
        <Charts activities={allActivities} />
      </div>

      {/* Meeting Vault: recent bookings synced from Firestore */}
      <div className="mb-8">
        <MeetingVault bookings={recentBookings} />
      </div>
    </div>
  )
}

export default SDRView

