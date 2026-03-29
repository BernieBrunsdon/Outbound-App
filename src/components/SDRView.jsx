import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { SDRS } from '../utils/constants'
import ActivityForm from './ActivityForm'
import Charts from './Charts'
import MeetingVault from './MeetingVault'
import { Calendar, TrendingUp } from 'lucide-react'
import { filterActivitiesByTimeView } from '../utils/activityFilters'

const periodLabelFor = (timeView) =>
  timeView === 'daily' ? 'Daily' : timeView === 'weekly' ? 'Weekly' : 'Monthly'

const SDRView = ({ sdrId }) => {
  const { getActivitiesBySDR, getRecentBookingsForSDR } = useApp()
  const [timeView, setTimeView] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const sdr = SDRS.find((s) => s.id === sdrId)
  const allActivities = getActivitiesBySDR(sdrId)

  const filteredActivities = useMemo(
    () => filterActivitiesByTimeView(allActivities, timeView, selectedDate),
    [allActivities, timeView, selectedDate]
  )

  const recentBookings = getRecentBookingsForSDR(sdrId, 40)
  const periodLabel = periodLabelFor(timeView)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 ${sdr.color} rounded-2xl flex items-center justify-center shadow-md shadow-slate-200/60`}>
            <span className="text-white font-bold text-lg">
              {sdr.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink tracking-tight">{sdr.name}</h1>
            <p className="text-ink-muted">{sdr.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-2 shadow-md shadow-slate-200/40 border border-slate-100/90">
          <Calendar className="w-5 h-5 text-ink-muted ml-2 shrink-0" aria-hidden />
          <div className="flex gap-1.5">
            {['daily', 'weekly', 'monthly'].map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setTimeView(view)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  timeView === view
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-muted hover:bg-slate-50'
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
            className="ml-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
          />
        </div>
      </div>

      <div className="mb-8">
        <ActivityForm sdrId={sdrId} date={selectedDate} timeView={timeView} />
      </div>

      <div className="mb-8">
        <MeetingVault bookings={recentBookings} />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-600" aria-hidden />
          <h2 className="text-2xl font-bold text-ink tracking-tight">Performance</h2>
        </div>
        <Charts activities={filteredActivities} periodLabel={periodLabel} />
      </div>
    </div>
  )
}

export default SDRView
