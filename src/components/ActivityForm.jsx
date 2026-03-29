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
    followUps: 0,
    emailsSent: 0,
    linkedinTouches: 0,
    meetingsBooked: 0,
    meetingsAttended: 0,
  })
  const [bookingRows, setBookingRows] = useState([])
  const [bookingSectionOpen, setBookingSectionOpen] = useState(false)
  const [rawLogOpen, setRawLogOpen] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

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
        followUps: existing.followUps || 0,
        emailsSent: existing.emailsSent || 0,
        linkedinTouches: existing.linkedinTouches || 0,
        meetingsBooked: existing.meetingsBooked || 0,
        meetingsAttended: existing.meetingsAttended || 0,
      })
      const mb = existing.meetingsBooked || 0
      setBookingRows(buildRowsForLoad(mb, saved))
    } else {
      setFormData({
        callsMade: 0,
        decisionMakers: 0,
        followUps: 0,
        emailsSent: 0,
        linkedinTouches: 0,
        meetingsBooked: 0,
        meetingsAttended: 0,
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

  const handleSave = async () => {
    setSaveError('')
    setSaving(true)
    try {
      const activity = {
        id: `${sdrId}-${date}`,
        sdrId,
        date,
        ...formData,
      }
      await saveActivity(activity)

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

        await saveBookingsForActivityDate(sdrId, date, records)
      } else {
        await saveBookingsForActivityDate(sdrId, date, [])
      }
    } catch (err) {
      setSaveError(err?.message || 'Save failed. Check Firestore rules and your connection.')
    } finally {
      setSaving(false)
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
    { key: 'callsMade', label: 'Calls made', icon: '📞', color: 'blue' },
    { key: 'decisionMakers', label: 'Decision makers spoken to', icon: '👔', color: 'green' },
    { key: 'emailsSent', label: 'Emails sent', icon: '✉️', color: 'sky' },
    { key: 'linkedinTouches', label: 'LinkedIn touches', icon: '🔗', color: 'indigo' },
    { key: 'followUps', label: 'Follow-ups scheduled', icon: '📅', color: 'indigo' },
    { key: 'meetingsBooked', label: 'Meetings booked', icon: '🎯', color: 'pink' },
    { key: 'meetingsAttended', label: 'Meetings attended', icon: '🤝', color: 'emerald' },
  ]

  const showBookings = formData.meetingsBooked > 0

  return (
    <div className="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-100/80 p-6 md:p-8">
      <h2 className="text-xl font-bold text-ink mb-1">
        Activity entry —{' '}
        {new Date(date).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {timeView !== 'daily' && (
          <span className="text-base font-normal text-ink-muted ml-2">(editing this date)</span>
        )}
      </h2>
      <p className="text-sm text-ink-muted mb-6">
        Log activity below; charts and the meeting vault reflect what you save for each day.
      </p>

      <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 shadow-sm overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => setRawLogOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-4 md:px-5 text-left bg-white/90 hover:bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
        >
          <div>
            <span className="font-semibold text-ink">Raw activity log</span>
            <span className="block text-sm text-ink-muted mt-0.5">
              Calls, email, LinkedIn, follow-ups, meetings booked & attended
            </span>
          </div>
          {rawLogOpen ? (
            <ChevronUp className="w-5 h-5 text-ink-muted shrink-0" aria-hidden />
          ) : (
            <ChevronDown className="w-5 h-5 text-ink-muted shrink-0" aria-hidden />
          )}
        </button>

        {rawLogOpen && (
          <div className="px-4 pb-5 pt-0 md:px-5 border-t border-slate-100 bg-white/60">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="border border-slate-200/90 rounded-xl p-4 bg-white shadow-sm hover:shadow-md hover:border-primary-200/80 transition focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0" aria-hidden>
                        {field.icon}
                      </span>
                      <label className="font-medium text-ink text-sm leading-snug">
                        {field.label}
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateField(field.key, -1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      <Minus className="w-4 h-4 text-ink-muted" />
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
                        className="w-full text-3xl font-bold text-center bg-transparent border-none outline-none text-ink focus:ring-0"
                        min="0"
                        max="200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField(field.key, 1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      <Plus className="w-4 h-4 text-ink-muted" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showBookings && (
        <div className="mb-6 rounded-xl border border-primary-100 bg-primary-50/25 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setBookingSectionOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-4 md:px-5 bg-white/90 hover:bg-white transition text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          >
            <div>
              <span className="font-semibold text-ink">Meeting vault entries</span>
              <span className="text-sm text-ink-muted ml-2">
                ({formData.meetingsBooked} meeting{formData.meetingsBooked !== 1 ? 's' : ''})
              </span>
            </div>
            {bookingSectionOpen ? (
              <ChevronUp className="w-5 h-5 text-ink-muted shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-5 h-5 text-ink-muted shrink-0" aria-hidden />
            )}
          </button>

          {bookingSectionOpen && (
            <div className="p-4 md:p-5 space-y-6 border-t border-primary-100/80">
              {bookingRows.map((row, index) => (
                <div
                  key={row.id || `row-${index}`}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 md:p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-ink-muted mb-3">
                    Meeting {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Prospect name
                      </label>
                      <input
                        type="text"
                        value={row.prospectName}
                        onChange={(e) => updateBookingRow(index, 'prospectName', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={row.prospectTitle}
                        onChange={(e) => updateBookingRow(index, 'prospectTitle', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                        placeholder="VP Sales"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={row.companyName}
                        onChange={(e) => updateBookingRow(index, 'companyName', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Meeting date
                      </label>
                      <input
                        type="date"
                        value={row.meetingDate}
                        onChange={(e) => updateBookingRow(index, 'meetingDate', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={row.linkedinUrl}
                        onChange={(e) => updateBookingRow(index, 'linkedinUrl', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Reason for booking / notes
                      </label>
                      <textarea
                        value={row.notes}
                        onChange={(e) => updateBookingRow(index, 'notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent resize-y"
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

      {saveError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {saveError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-md shadow-primary-500/25 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <Save className="w-5 h-5" aria-hidden />
        {saving ? 'Saving…' : 'Save activity'}
      </button>
    </div>
  )
}

export default ActivityForm
