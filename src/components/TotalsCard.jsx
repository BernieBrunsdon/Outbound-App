import { TrendingUp, Phone, Users, Calendar, Target } from 'lucide-react'

const TotalsCard = ({ activities, timeView }) => {
  const totals = activities.reduce(
    (acc, activity) => ({
      callsMade: acc.callsMade + (activity.callsMade || 0),
      decisionMakers: acc.decisionMakers + (activity.decisionMakers || 0),
      voicemails: acc.voicemails + (activity.voicemails || 0),
      noAnswer: acc.noAnswer + (activity.noAnswer || 0),
      gatekeeper: acc.gatekeeper + (activity.gatekeeper || 0),
      followUps: acc.followUps + (activity.followUps || 0),
      meetingsBooked: acc.meetingsBooked + (activity.meetingsBooked || 0),
    }),
    {
      callsMade: 0,
      decisionMakers: 0,
      voicemails: 0,
      noAnswer: 0,
      gatekeeper: 0,
      followUps: 0,
      meetingsBooked: 0,
    }
  )

  const dmRate =
    totals.callsMade > 0
      ? ((totals.decisionMakers / totals.callsMade) * 100).toFixed(1)
      : null

  const stats = [
    {
      label: 'Total Calls',
      value: totals.callsMade,
      icon: Phone,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Decision Makers',
      value: totals.decisionMakers,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Meetings Booked',
      value: totals.meetingsBooked,
      icon: Target,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Follow-ups',
      value: totals.followUps,
      icon: Calendar,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ]

  const periodLabel =
    timeView === 'daily'
      ? 'Daily'
      : timeView === 'weekly'
        ? 'Weekly'
        : 'Monthly'

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary-600 shrink-0" />
          <h2 className="text-2xl font-bold text-gray-900">{periodLabel} Totals</h2>
        </div>
        {dmRate !== null ? (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold w-fit"
            title="Decision makers ÷ total calls"
          >
            <span className="text-emerald-700">Conversion rate</span>
            <span className="tabular-nums">{dmRate}%</span>
            <span className="text-emerald-600 font-normal text-xs hidden sm:inline">
              (DMs / calls)
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium w-fit">
            Conversion rate — add calls to calculate
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-xl p-6 border-2 border-transparent hover:border-gray-200 transition`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Voicemails:</span>
            <span className="ml-2 font-semibold text-gray-900">{totals.voicemails}</span>
          </div>
          <div>
            <span className="text-gray-600">No answer:</span>
            <span className="ml-2 font-semibold text-gray-900">{totals.noAnswer}</span>
          </div>
          <div>
            <span className="text-gray-600">Gatekeeper:</span>
            <span className="ml-2 font-semibold text-gray-900">{totals.gatekeeper}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TotalsCard
