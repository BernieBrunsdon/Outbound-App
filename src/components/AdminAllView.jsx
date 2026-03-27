import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SDRS } from '../utils/constants'
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Calendar } from 'lucide-react'

const AdminAllView = ({ selectedDate, onDateChange }) => {
  const { getAllActivities } = useApp()
  const [timeView, setTimeView] = useState('daily')
  const allActivities = getAllActivities()

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

  // Aggregate by SDR
  const sdrStats = SDRS.map(sdr => {
    const sdrActivities = filteredActivities.filter(a => a.sdrId === sdr.id)
    return {
      sdrId: sdr.id,
      sdrName: sdr.name,
      color: sdr.color,
      callsMade: sdrActivities.reduce((sum, a) => sum + (a.callsMade || 0), 0),
      decisionMakers: sdrActivities.reduce((sum, a) => sum + (a.decisionMakers || 0), 0),
      voicemails: sdrActivities.reduce((sum, a) => sum + (a.voicemails || 0), 0),
      noAnswer: sdrActivities.reduce((sum, a) => sum + (a.noAnswer || 0), 0),
      gatekeeper: sdrActivities.reduce((sum, a) => sum + (a.gatekeeper || 0), 0),
      followUps: sdrActivities.reduce((sum, a) => sum + (a.followUps || 0), 0),
      meetingsBooked: sdrActivities.reduce((sum, a) => sum + (a.meetingsBooked || 0), 0),
    }
  })

  // Sort by meetings booked (performance ranking)
  const rankedStats = [...sdrStats].sort((a, b) => b.meetingsBooked - a.meetingsBooked)

  // Prepare chart data
  const chartData = sdrStats.map(stat => ({
    name: stat.sdrName.split(' ')[0],
    calls: stat.callsMade,
    meetings: stat.meetingsBooked,
    decisionMakers: stat.decisionMakers,
  }))

  // Overall totals
  const totals = sdrStats.reduce(
    (acc, stat) => ({
      callsMade: acc.callsMade + stat.callsMade,
      decisionMakers: acc.decisionMakers + stat.decisionMakers,
      meetingsBooked: acc.meetingsBooked + stat.meetingsBooked,
      followUps: acc.followUps + stat.followUps,
    }),
    { callsMade: 0, decisionMakers: 0, meetingsBooked: 0, followUps: 0 }
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All SDRs Overview</h1>
        
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
            onChange={(e) => onDateChange(e.target.value)}
            className="ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Overall Totals */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Team Totals</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Total Calls</div>
            <div className="text-3xl font-bold text-gray-900">{totals.callsMade}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Decision Makers</div>
            <div className="text-3xl font-bold text-gray-900">{totals.decisionMakers}</div>
          </div>
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Meetings Booked</div>
            <div className="text-3xl font-bold text-gray-900">{totals.meetingsBooked}</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Follow-ups</div>
            <div className="text-3xl font-bold text-gray-900">{totals.followUps}</div>
          </div>
        </div>
      </div>

      {/* Performance Ranking */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performance Ranking</h2>
        </div>
        <div className="space-y-4">
          {rankedStats.map((stat, index) => (
            <div
              key={stat.sdrId}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 transition"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 font-bold text-gray-700">
                #{index + 1}
              </div>
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{stat.sdrName}</div>
                <div className="text-sm text-gray-600">
                  {stat.callsMade} calls • {stat.meetingsBooked} meetings • {stat.decisionMakers} DMs
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{stat.meetingsBooked}</div>
                <div className="text-xs text-gray-500">meetings</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Calls Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Calls Made by SDR</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="calls" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meetings Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Meetings Booked by SDR</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="meetings" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Combined Performance */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Calls vs Meetings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="calls" fill="#0ea5e9" name="Calls Made" />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#ec4899"
                strokeWidth={3}
                name="Meetings Booked"
                dot={{ fill: '#ec4899', r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminAllView

