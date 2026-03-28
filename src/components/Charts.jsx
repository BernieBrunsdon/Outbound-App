import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { format, parseISO } from 'date-fns'

const Charts = ({ activities }) => {
  const dataByDate = {}

  activities.forEach((activity) => {
    if (!dataByDate[activity.date]) {
      dataByDate[activity.date] = {
        date: activity.date,
        callsMade: 0,
        decisionMakers: 0,
        voicemails: 0,
        noAnswer: 0,
        gatekeeper: 0,
        followUps: 0,
        meetingsBooked: 0,
      }
    }

    dataByDate[activity.date].callsMade += activity.callsMade || 0
    dataByDate[activity.date].decisionMakers += activity.decisionMakers || 0
    dataByDate[activity.date].voicemails += activity.voicemails || 0
    dataByDate[activity.date].noAnswer += activity.noAnswer || 0
    dataByDate[activity.date].gatekeeper += activity.gatekeeper || 0
    dataByDate[activity.date].followUps += activity.followUps || 0
    dataByDate[activity.date].meetingsBooked += activity.meetingsBooked || 0
  })

  const chartData = Object.values(dataByDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      ...item,
      dateLabel: format(parseISO(item.date), 'MMM dd'),
    }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Calls Made per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dateLabel" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="callsMade" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Meetings Booked Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dateLabel" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="meetingsBooked"
              stroke="#ec4899"
              fill="#ec4899"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Charts
