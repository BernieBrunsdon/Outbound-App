import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Save, Plus, Minus } from 'lucide-react'

const ActivityForm = ({ sdrId, date, timeView }) => {
  const { getActivity, saveActivity } = useApp()
  const [formData, setFormData] = useState({
    callsMade: 0,
    decisionMakers: 0,
    voicemails: 0,
    noAnswer: 0,
    gatekeeper: 0,
    followUps: 0,
    meetingsBooked: 0,
  })

  useEffect(() => {
    const existing = getActivity(sdrId, date)
    if (existing) {
      setFormData({
        callsMade: existing.callsMade || 0,
        decisionMakers: existing.decisionMakers || 0,
        voicemails: existing.voicemails || 0,
        noAnswer: existing.noAnswer || 0,
        gatekeeper: existing.gatekeeper || 0,
        followUps: existing.followUps || 0,
        meetingsBooked: existing.meetingsBooked || 0,
      })
    } else {
      setFormData({
        callsMade: 0,
        decisionMakers: 0,
        voicemails: 0,
        noAnswer: 0,
        gatekeeper: 0,
        followUps: 0,
        meetingsBooked: 0,
      })
    }
  }, [sdrId, date, getActivity])

  const handleSave = () => {
    const activity = {
      id: `${sdrId}-${date}`,
      sdrId,
      date,
      ...formData,
    }
    saveActivity(activity)
  }

  const updateField = (field, delta) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(200, prev[field] + delta)),
    }))
  }

  const fields = [
    { key: 'callsMade', label: 'Calls Made', icon: '📞', color: 'blue' },
    { key: 'decisionMakers', label: 'Decision Makers Spoken To', icon: '👔', color: 'green' },
    { key: 'voicemails', label: 'Voicemails Left', icon: '📱', color: 'purple' },
    { key: 'noAnswer', label: 'No Answer', icon: '❌', color: 'gray' },
    { key: 'gatekeeper', label: 'Gatekeeper Answered', icon: '🚪', color: 'orange' },
    { key: 'followUps', label: 'Follow-ups Scheduled', icon: '📅', color: 'indigo' },
    { key: 'meetingsBooked', label: 'Meetings Booked', icon: '🎯', color: 'pink' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Activity Entry - {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {fields.map((field) => (
          <div
            key={field.key}
            className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{field.icon}</span>
                <label className="font-medium text-gray-700 text-sm">
                  {field.label}
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateField(field.key, -1)}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={formData[field.key]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(200, parseInt(e.target.value) || 0))
                    setFormData(prev => ({ ...prev, [field.key]: value }))
                  }}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none outline-none text-gray-900"
                  min="0"
                  max="200"
                />
              </div>
              <button
                onClick={() => updateField(field.key, 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save Activity
      </button>
    </div>
  )
}

export default ActivityForm

