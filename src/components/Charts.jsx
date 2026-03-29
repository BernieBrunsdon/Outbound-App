import { format } from 'date-fns'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts'
import { ymdFromActivityDate } from '../utils/activityFilters'

const Charts = ({ activities, periodLabel = 'Period' }) => {
  const booked = activities.reduce((s, a) => s + (a.meetingsBooked || 0), 0)
  const attended = activities.reduce((s, a) => s + (a.meetingsAttended || 0), 0)
  const showRatePct =
    booked > 0 ? Math.round((attended / booked) * 1000) / 10 : null
  const attendedDisplay = Number.isInteger(attended) ? attended : attended.toFixed(1)

  const channelTotals = activities.reduce(
    (acc, a) => ({
      calls: acc.calls + (a.callsMade || 0),
      email: acc.email + (a.emailsSent || 0),
      linkedin: acc.linkedin + (a.linkedinTouches || 0),
    }),
    { calls: 0, email: 0, linkedin: 0 }
  )

  const channelRows = [
    {
      name: 'Calls',
      value: channelTotals.calls,
      gradId: 'pieCalls',
      swatch: 'bg-gradient-to-br from-sky-400 to-primary-600',
    },
    {
      name: 'Email',
      value: channelTotals.email,
      gradId: 'pieEmail',
      swatch: 'bg-gradient-to-br from-emerald-400 to-accent-500',
    },
    {
      name: 'LinkedIn',
      value: channelTotals.linkedin,
      gradId: 'pieLi',
      swatch: 'bg-gradient-to-br from-indigo-300 to-indigo-600',
    },
  ]

  const totalTouches =
    channelTotals.calls + channelTotals.email + channelTotals.linkedin

  const pieData = channelRows
    .map((c) => ({ name: c.name, value: c.value, color: c.gradId }))
    .filter((d) => d.value > 0)

  const pieEmpty = pieData.length === 0

  const timelineMap = {}
  activities.forEach((a) => {
    const ymd = ymdFromActivityDate(a.date)
    if (!ymd) return
    if (!timelineMap[ymd]) {
      timelineMap[ymd] = {
        date: ymd,
        callsMade: 0,
        decisionMakers: 0,
        meetingsBooked: 0,
        meetingsAttended: 0,
      }
    }
    timelineMap[ymd].callsMade += a.callsMade || 0
    timelineMap[ymd].decisionMakers += a.decisionMakers || 0
    timelineMap[ymd].meetingsBooked += a.meetingsBooked || 0
    timelineMap[ymd].meetingsAttended += a.meetingsAttended || 0
  })

  const timelineData = Object.values(timelineMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      dateLabel: format(localDateFromYmd(row.date), 'MMM d'),
    }))

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.15)',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-100/80 p-6 md:p-8">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-ink tracking-tight">Momentum</h3>
          <p className="text-sm text-ink-muted mt-1">
            Show rate for this {periodLabel.toLowerCase()} window — attended ÷ booked.
          </p>
        </div>

        {booked <= 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center text-center rounded-xl bg-slate-50/80 border border-dashed border-slate-200 px-6 py-12">
            <p className="text-ink-muted text-sm max-w-md">
              Log at least one meeting booked in this period to calculate show rate.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] py-8 px-4 rounded-xl bg-gradient-to-b from-accent-50/40 to-white border border-slate-100/90">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
              Show rate
            </p>
            <p
              className="text-6xl md:text-7xl font-bold tabular-nums tracking-tight text-accent-600"
              aria-live="polite"
            >
              {showRatePct}%
            </p>
            <p className="mt-4 text-sm text-ink-muted">
              <span className="font-semibold text-ink">{attendedDisplay}</span> attended
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="font-semibold text-ink">{booked}</span> booked
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-100/80 p-6 md:p-8 flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-ink tracking-tight">Channel mix</h3>
          <p className="text-sm text-ink-muted mt-1">
            Omnichannel outreach breakdown
          </p>
        </div>
        <div className="flex-1 min-h-[280px] flex flex-col">
          {pieEmpty ? (
            <div className="h-full flex items-center justify-center text-ink-muted text-sm rounded-xl bg-slate-50/80 border border-dashed border-slate-200">
              Log calls, email, or LinkedIn touches to see the split.
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="pieCalls" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0B63D6" />
                      </linearGradient>
                      <linearGradient id="pieEmail" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#06A77D" />
                      </linearGradient>
                      <linearGradient id="pieLi" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a5b4fc" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={86}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => {
                        const grad =
                          entry.name === 'Calls'
                            ? 'url(#pieCalls)'
                            : entry.name === 'Email'
                              ? 'url(#pieEmail)'
                              : 'url(#pieLi)'
                        return <Cell key={`cell-${index}`} fill={grad} />
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [
                        `${value} (${totalTouches > 0 ? Math.round((value / totalTouches) * 100) : 0}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                  aria-hidden
                >
                  <p className="text-2xl font-bold tabular-nums text-ink leading-none">
                    {totalTouches}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Total
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                {channelRows.map((row) => {
                  const pct =
                    totalTouches > 0
                      ? Math.round((row.value / totalTouches) * 100)
                      : 0
                  return (
                    <li
                      key={row.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/5 ${row.swatch}`}
                          aria-hidden
                        />
                        <span className="font-medium text-ink truncate">{row.name}</span>
                      </span>
                      <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                        <span className="font-semibold text-ink">{row.value}</span>
                        <span className="text-xs text-ink-muted w-9 text-right">{pct}%</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-100/80 p-6 md:p-8">
          <h3 className="text-lg font-bold text-ink tracking-tight">
            Meetings trend
          </h3>
          <p className="text-sm text-ink-muted mt-1 mb-4">
            Booked vs attended over this {periodLabel.toLowerCase()} window.
          </p>
          {timelineData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-ink-muted text-sm rounded-xl bg-slate-50/80 border border-dashed border-slate-200">
              No activity logged for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="bookedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B63D6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0B63D6" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="attendedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06A77D" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06A77D" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="meetingsBooked"
                  name="Booked"
                  stroke="#0B63D6"
                  fill="url(#bookedArea)"
                  strokeWidth={2.2}
                />
                <Area
                  type="monotone"
                  dataKey="meetingsAttended"
                  name="Attended"
                  stroke="#06A77D"
                  fill="url(#attendedArea)"
                  strokeWidth={2.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-100/80 p-6 md:p-8">
          <h3 className="text-lg font-bold text-ink tracking-tight">
            Outreach &amp; DM trend
          </h3>
          <p className="text-sm text-ink-muted mt-1 mb-4">
            Daily calls and decision-maker conversations in this period.
          </p>
          {timelineData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-ink-muted text-sm rounded-xl bg-slate-50/80 border border-dashed border-slate-200">
              No activity logged for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="callsMade" name="Calls" fill="#0B63D6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="decisionMakers" name="Decision makers" fill="#06A77D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function localDateFromYmd(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default Charts
