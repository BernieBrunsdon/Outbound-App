import { useState, Fragment } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { Linkedin, ChevronDown, ChevronRight } from 'lucide-react'
import { normalizeLinkedInUrl } from '../utils/bookings'

const formatMeetingDate = (value) => {
  if (!value) return '—'
  try {
    const d = parseISO(value)
    return isValid(d) ? format(d, 'EEEE, d MMM yyyy') : value
  } catch {
    return value
  }
}

/** Placeholder lead temperature until stored on booking records */
function leadTemperatureForBooking(booking) {
  const key = `${booking.prospectName || ''}${booking.companyName || ''}${booking.id || ''}`
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h << 5) - h + key.charCodeAt(i)
  const temps = ['Hot', 'Warm', 'Nurture']
  return temps[Math.abs(h) % temps.length]
}

const tempStyles = {
  Hot: 'bg-rose-50 text-rose-800 ring-rose-200/80',
  Warm: 'bg-amber-50 text-amber-900 ring-amber-200/80',
  Nurture: 'bg-slate-100 text-slate-700 ring-slate-200/80',
}

const MeetingVault = ({ bookings }) => {
  const [expandedId, setExpandedId] = useState(null)
  const [listOpen, setListOpen] = useState(true)

  if (!bookings.length) {
    return (
      <div className="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-100/80 p-8 md:p-10">
        <h2 className="text-xl font-bold text-ink tracking-tight">Meeting Vault</h2>
        <p className="text-ink-muted text-sm mt-2 max-w-lg leading-relaxed">
          When meetings are logged with prospect context, they appear here — your proof of
          meetings, newest first.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-slate-200/40 border border-slate-100/90 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          className="w-full flex items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
          aria-expanded={listOpen}
          aria-label={listOpen ? 'Collapse meeting list' : 'Expand meeting list'}
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-ink tracking-tight">Meeting Vault</h2>
            <p className="text-sm text-ink-muted mt-1.5 max-w-2xl">
              Qualified conversations — prospect, company, intent, and social proof in one place.
            </p>
          </div>
          <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted">
            {listOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        </button>
      </div>

      {listOpen && <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead>
            <tr className="bg-slate-50/90 text-ink-muted border-b border-slate-200">
              <th className="px-5 py-4 font-semibold whitespace-nowrap w-10" aria-hidden />
              <th className="px-5 py-4 font-semibold min-w-[200px]">Prospect</th>
              <th className="px-5 py-4 font-semibold min-w-[140px]">Company</th>
              <th className="px-5 py-4 font-semibold whitespace-nowrap text-center w-14">
                LinkedIn
              </th>
              <th className="px-5 py-4 font-semibold whitespace-nowrap">Meeting date</th>
              <th className="px-5 py-4 font-semibold min-w-[180px]">Context / intent</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, index) => {
              const href = normalizeLinkedInUrl(b.linkedinUrl)
              const open = expandedId === b.id
              const temp = leadTemperatureForBooking(b)
              const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'

              return (
                <Fragment key={b.id}>
                  <tr
                    className={`border-b border-slate-100/90 ${rowBg} hover:bg-primary-50/20 transition-colors shadow-sm/50`}
                  >
                    <td className="px-2 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => setExpandedId(open ? null : b.id)}
                        className="mx-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-white hover:text-primary-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        aria-expanded={open}
                        aria-label={open ? 'Collapse meeting context' : 'Expand meeting context'}
                      >
                        {open ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-ink leading-snug">
                        {b.prospectName || '—'}
                      </div>
                      <div className="text-ink-muted font-medium mt-1 text-[13px]">
                        {b.prospectTitle || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-ink/90">{b.companyName || '—'}</td>
                    <td className="px-5 py-4 align-middle text-center">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100 hover:bg-primary-100 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                          title="Open LinkedIn profile"
                        >
                          <Linkedin className="w-5 h-5" aria-hidden />
                          <span className="sr-only">LinkedIn profile</span>
                        </a>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top whitespace-nowrap text-ink tabular-nums">
                      {formatMeetingDate(b.meetingDate)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${tempStyles[temp]}`}
                        >
                          {temp}
                        </span>
                        {!open && (
                          <p className="text-ink/90 line-clamp-2 leading-relaxed max-w-md">
                            {b.notes || (
                              <span className="text-ink-muted italic">No context yet</span>
                            )}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr
                      key={`${b.id}-detail`}
                      className={`${rowBg} border-b border-slate-100`}
                    >
                      <td colSpan={6} className="px-5 pb-6 pt-0 md:px-8">
                        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-inner shadow-slate-100/80">
                          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">
                            Meeting context / intent
                          </p>
                          <p className="text-ink leading-relaxed whitespace-pre-wrap">
                            {b.notes || '—'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>}
    </div>
  )
}

export default MeetingVault
