import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { SDRS, CLIENT_CELL_SDR_IDS } from '../utils/constants'
import Charts from './Charts'
import MeetingVault from './MeetingVault'
import { Calendar, LayoutGrid, User } from 'lucide-react'
import { filterActivitiesByTimeView } from '../utils/activityFilters'

const periodLabelFor = (timeView) =>
  timeView === 'daily' ? 'Daily' : timeView === 'weekly' ? 'Weekly' : 'Monthly'

const ClientView = () => {
  const { getAllActivities, getRecentBookingsForSDR, getRecentBookingsForSDRs } = useApp()
  const [timeView, setTimeView] = useState('weekly')
  const [scope, setScope] = useState('cell')
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )

  const cellSdrList = useMemo(
    () => SDRS.filter((s) => CLIENT_CELL_SDR_IDS.includes(s.id)),
    []
  )

  const allActivities = getAllActivities()

  const scopeActivities = useMemo(() => {
    if (scope === 'cell') {
      return allActivities.filter((a) => CLIENT_CELL_SDR_IDS.includes(a.sdrId))
    }
    return allActivities.filter((a) => a.sdrId === scope)
  }, [allActivities, scope])

  const filteredActivities = useMemo(
    () => filterActivitiesByTimeView(scopeActivities, timeView, selectedDate),
    [scopeActivities, timeView, selectedDate]
  )

  const vaultBookings = useMemo(() => {
    if (scope === 'cell') {
      return getRecentBookingsForSDRs(CLIENT_CELL_SDR_IDS, 40)
    }
    return getRecentBookingsForSDR(scope, 40)
  }, [scope, getRecentBookingsForSDRs, getRecentBookingsForSDR])

  const periodLabel = periodLabelFor(timeView)

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
          OG Pulse · Client overview
        </p>
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">
          Your dedicated cell
        </h1>
        <p className="text-ink-muted max-w-2xl leading-relaxed">
          Aggregated performance across your assigned SDRs. Switch to a rep to drill into individual
          momentum.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="inline-flex rounded-xl bg-white p-1.5 shadow-md shadow-slate-200/40 border border-slate-100/90"
            role="tablist"
            aria-label="View scope"
          >
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'cell'}
              onClick={() => setScope('cell')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                scope === 'cell'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden />
              Cell overview
            </button>
            {cellSdrList.map((sdr) => (
              <button
                key={sdr.id}
                type="button"
                role="tab"
                aria-selected={scope === sdr.id}
                onClick={() => setScope(sdr.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  scope === sdr.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" aria-hidden />
                {sdr.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-2 shadow-md shadow-slate-200/40 border border-slate-100/90">
            <Calendar className="w-5 h-5 text-ink-muted ml-2 shrink-0" aria-hidden />
            <div className="flex gap-1.5">
              {['daily', 'weekly', 'monthly'].map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setTimeView(view)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
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
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-ink bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
            />
          </div>
        </div>
      </header>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink tracking-tight mb-1">Performance</h2>
        <p className="text-sm text-ink-muted mb-4">
          {periodLabel} trends{scope !== 'cell' ? ` · ${SDRS.find((s) => s.id === scope)?.name}` : ''}
        </p>
        <Charts activities={filteredActivities} periodLabel={periodLabel} />
      </div>

      <div className="mb-8">
        <MeetingVault bookings={vaultBookings} />
      </div>
    </div>
  )
}

export default ClientView
