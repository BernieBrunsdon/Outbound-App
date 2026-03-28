import { useState, useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Save, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import {
  createEmptyBookingDraft,
  toBookingRecord,
} from '../utils/bookings'

const draftFromSaved = (b) => ({
  id: b.id,
  prospectName: b.prospectName || '',
  prospectTitle: b.prospectTitle || '',
  companyName: b.companyName || '',
  linkedinUrl: b.linkedinUrl || '',
  meetingDate: b.meetingDate || '',
  notes: b.notes || '',
  createdAt: b.createdAt,
})

const buildRowsForLoad = (meetingsBooked, saved) => {
  const n = meetingsBooked
  if (n <= 0) return []
  const out = []
  for (let i = 0; i < n; i++) {
    if (saved[i]) out.push(draftFromSaved(saved[i]))
    else out.push(createEmptyBookingDraft())
  }
  return out
}

const resizeRows = (prev, n) => {
  if (n <= 0) return []
  const next = [...prev]
  while (next.length < n) next.push(createEmptyBookingDraft())
  if (next.length > n) next.length = n
  return next
}

const ActivityForm = ({ sdrId, date, timeView }) => {
  const { activities, bookings, saveActivity, saveBookingsForActivityDate } = useApp()
  const [formData, setFormData] = useState({
    callsMade: 0,
    decisionMakers: 0,
    voicemails: 0,
    noAnswer: 0,
    gatekeeper: 0,
    followUps: 0,
    meetingsBooked: 0,
  })
  const [bookingRows, setBookingRows] = useState([])
  const [bookingSectionOpen, setBookingSectionOpen] = useState(false)

  const activityForDay = useMemo(
    () => activities.find((a) => a.sdrId === sdrId && a.date === date),
    [activities, sdrId, date]
  )

  const bookingsKey = useMemo(() => {
    return bookings
      .filter((b) => b.sdrId === sdrId && b.activityDate === date)
      .map((b) => `${b.id}|${b.prospectName}|${b.meetingDate}|${b.notes?.length ?? 0}`)
      .sort()
      .join('~')
  }, [bookings, sdrId, date])

  const bookingsRef = useRef(bookings)
  bookingsRef.current = bookings

  useEffect(() => {
    const existing = activityForDay
    const saved = bookingsRef.current.filter((b) => b.sdrId === sdrId && b.activityDate === date)

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
      const mb = existing.meetingsBooked || 0
      setBookingRows(buildRowsForLoad(mb, saved))
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
      setBookingRows([])
    }
  }, [sdrId, date, activityForDay, bookingsKey])

  useEffect(() => {
    if (formData.meetingsBooked > 0) setBookingSectionOpen(true)
  }, [formData.meetingsBooked])

  const updateField = (field, delta) => {
    setFormData((prev) => {
      const nextVal = Math.max(0, Math.min(200, prev[field] + delta))
      const next = { ...prev, [field]: nextVal }
      if (field === 'meetingsBooked') {
        setBookingRows((rows) => resizeRows(rows, nextVal))
      }
      return next
    })
  }

  const handleSave = () => {
    const activity = {
      id: `${sdrId}-${date}`,
      sdrId,
      date,
      ...formData,
    }
    saveActivity(activity)

    const mb = formData.meetingsBooked
    if (mb > 0) {
      const hasContent = (row) =>
        (row.prospectName || '').trim() ||
        (row.notes || '').trim() ||
        (row.companyName || '').trim() ||
        (row.linkedinUrl || '').trim() ||
        (row.meetingDate || '').trim() ||
        (row.prospectTitle || '').trim()

      const records = bookingRows
        .slice(0, mb)
        .filter(hasContent)
        .map((row) => toBookingRecord(row, sdrId, date))

      saveBookingsForActivityDate(sdrId, date, records)
    } else {
      saveBookingsForActivityDate(sdrId, date, [])
    }
  }

  const updateBookingRow = (index, key, value) => {
    setBookingRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
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

  const showBookings = formData.meetingsBooked > 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Activity Entry -{' '}
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {timeView !== 'daily' && (
          <span className="text-base font-normal text-gray-500 ml-2">(editing this date)</span>
        )}
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
                <label className="font-medium text-gray-700 text-sm">{field.label}</label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
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
                    const value = Math.max(0, Math.min(200, parseInt(e.target.value, 10) || 0))
                    setFormData((prev) => {
                      const next = { ...prev, [field.key]: value }
                      if (field.key === 'meetingsBooked') {
                        setBookingRows((rows) => resizeRows(rows, value))
                      }
                      return next
                    })
                  }}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none outline-none text-gray-900"
                  min="0"
                  max="200"
                />
              </div>
              <button
                type="button"
                onClick={() => updateField(field.key, 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showBookings && (
        <div className="mb-6 border-2 border-primary-100 rounded-2xl overflow-hidden bg-primary-50/30">
          <button
            type="button"
            onClick={() => setBookingSectionOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/80 hover:bg-white transition text-left"
          >
            <div>
              <span className="font-semibold text-gray-900">New booking details</span>
              <span className="text-sm text-gray-600 ml-2">
                ({formData.meetingsBooked} meeting{formData.meetingsBooked !== 1 ? 's' : ''})
              </span>
            </div>
            {bookingSectionOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
            )}
          </button>

          {bookingSectionOpen && (
            <div className="p-4 space-y-6 border-t border-primary-100">
              {bookingRows.map((row, index) => (
                <div
                  key={row.id || `row-${index}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    Meeting {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Prospect name
                      </label>
                      <input
                        type="text"
                        value={row.prospectName}
                        onChange={(e) => updateBookingRow(index, 'prospectName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={row.prospectTitle}
                        onChange={(e) => updateBookingRow(index, 'prospectTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="VP Sales"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={row.companyName}
                        onChange={(e) => updateBookingRow(index, 'companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Meeting date
                      </label>
                      <input
                        type="date"
                        value={row.meetingDate}
                        onChange={(e) => updateBookingRow(index, 'meetingDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={row.linkedinUrl}
                        onChange={(e) => updateBookingRow(index, 'linkedinUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Reason for booking / notes
                      </label>
                      <textarea
                        value={row.notes}
                        onChange={(e) => updateBookingRow(index, 'notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y"
                        placeholder="Why they agreed, trigger, context — key quality signal for the client."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
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
