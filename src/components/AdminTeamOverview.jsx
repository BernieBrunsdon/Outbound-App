import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { SDRS } from '../utils/constants'
import { filterActivitiesByTimeView } from '../utils/activityFilters'
import {
  aggregateActivityStats,
  omnichannelTouches,
  showRatePercent,
} from '../utils/activityStats'
import { Calendar, Building2, Users, Radio, Target, UserCheck, Percent } from 'lucide-react'

const periodLabelFor = (timeView) =>
  timeView === 'daily' ? 'Daily' : timeView === 'weekly' ? 'Weekly' : 'Monthly'

const Stat = ({ label, value, icon: Icon, sub }) => (
  <div className="rounded-lg bg-slate-50/90 border border-slate-100 px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />}
      {label}
    </div>
    <div className="mt-1 text-lg font-bold tabular-nums text-ink leading-tight">{value}</div>
    {sub && <div className="text-[11px] text-ink-muted mt-0.5">{sub}</div>}
  </div>
)

const AdminTeamOverview = () => {
  const { getActivitiesBySDR } = useApp()
  const [timeView, setTimeView] = useState('weekly')
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )

  const periodLabel = periodLabelFor(timeView)

  const repSummaries = useMemo(() => {
    return SDRS.map((sdr) => {
      const raw = getActivitiesBySDR(sdr.id)
      const filtered = filterActivitiesByTimeView(raw, timeView, selectedDate)
      const stats = aggregateActivityStats(filtered)
      const touches = omnichannelTouches(stats)
      const sr = showRatePercent(stats)
      return { sdr, filtered, stats, touches, showRate: sr }
    })
  }, [getActivitiesBySDR, timeView, selectedDate])

  const teamTotals = useMemo(() => {
    return repSummaries.reduce(
      (acc, row) => {
        acc.booked += row.stats.meetingsBooked
        acc.attended += row.stats.meetingsAttended
        acc.touches += row.touches
        acc.dms += row.stats.decisionMakers
        return acc
      },
      { booked: 0, attended: 0, touches: 0, dms: 0 }
    )
  }, [repSummaries])

  const teamShowRate =
    teamTotals.booked > 0
      ? Math.round((teamTotals.attended / teamTotals.booked) * 1000) / 10
      : null

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
          Outbound Growth · Operations
        </p>
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">
          Team performance
        </h1>
        <p className="text-ink-muted max-w-2xl leading-relaxed">
          One place to review every SDR: client account, outreach volume, pipeline, and show rate.
          Pick any day, week, or month.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 bg-white rounded-xl p-2 shadow-md shadow-slate-200/40 border border-slate-100/90">
          <Calendar className="w-5 h-5 text-ink-muted ml-2 shrink-0" aria-hidden />
          <div className="flex gap-1.5">
            {['daily', 'weekly', 'monthly'].map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setTimeView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
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
            title="Anchor date: day itself, or the week / month that contains this date"
          />
          <span className="text-xs text-ink-muted hidden sm:inline max-w-[200px]">
            {periodLabel} window
          </span>
        </div>
      </header>

      {/* Team roll-up */}
      <div className="mb-10 rounded-xl border border-primary-100 bg-gradient-to-r from-primary-50/80 to-white p-5 md:p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-600" aria-hidden />
          Team totals · {periodLabel}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Omnichannel touches" value={teamTotals.touches} icon={Radio} />
          <Stat label="Decision makers" value={teamTotals.dms} icon={Users} />
          <Stat label="Meetings booked" value={teamTotals.booked} icon={Target} />
          <Stat
            label="Show rate"
            value={teamShowRate != null ? `${teamShowRate}%` : '—'}
            icon={Percent}
            sub={
              teamTotals.booked > 0
                ? `${teamTotals.attended} attended / ${teamTotals.booked} booked`
                : 'No meetings booked in range'
            }
          />
        </div>
      </div>

      <h2 className="text-lg font-bold text-ink mb-4">By rep &amp; account</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {repSummaries.map(({ sdr, stats, touches, showRate, filtered }) => {
          const hasActivity = filtered.length > 0
          return (
            <section
              key={sdr.id}
              className="rounded-xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-md shadow-slate-200/40"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow ${sdr.color}`}
                >
                  {sdr.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-ink text-lg leading-tight">{sdr.name}</h3>
                  <div className="mt-2 flex items-start gap-2 text-sm text-ink-muted">
                    <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-primary-500" aria-hidden />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Account
                      </span>
                      <p className="text-ink font-medium leading-snug">
                        {sdr.accountName || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {!hasActivity && (
                <p className="text-sm text-ink-muted mb-4 rounded-lg bg-slate-50 px-3 py-2 border border-dashed border-slate-200">
                  No activity logged in this {periodLabel.toLowerCase()} window.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Stat label="Touches" value={touches} icon={Radio} />
                <Stat label="DMs" value={stats.decisionMakers} icon={Users} />
                <Stat label="Follow-ups" value={stats.followUps} />
                <Stat label="Booked" value={stats.meetingsBooked} icon={Target} />
                <Stat label="Attended" value={stats.meetingsAttended} icon={UserCheck} />
                <Stat
                  label="Show rate"
                  value={showRate != null ? `${showRate}%` : '—'}
                  icon={Percent}
                />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default AdminTeamOverview
