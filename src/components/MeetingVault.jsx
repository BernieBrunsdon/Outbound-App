import { format, parseISO, isValid } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { normalizeLinkedInUrl } from '../utils/bookings'

const formatMeetingDate = (value) => {
  if (!value) return '—'
  try {
    const d = parseISO(value)
    return isValid(d) ? format(d, 'EEE, MMM d, yyyy') : value
  } catch {
    return value
  }
}

const MeetingVault = ({ bookings }) => {
  if (!bookings.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Meeting Vault</h2>
        <p className="text-gray-600 text-sm">
          When you book meetings and save prospect details, they will appear here — newest first.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Meeting Vault</h2>
        <p className="text-sm text-gray-600 mt-1">
          Recent bookings — reason for booking highlights call quality.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Prospect</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Title</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Company</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Meeting</th>
              <th className="px-4 py-3 font-semibold min-w-[200px]">Reason for booking</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">LinkedIn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => {
              const href = normalizeLinkedInUrl(b.linkedinUrl)
              return (
                <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.prospectName || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{b.prospectTitle || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{b.companyName || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatMeetingDate(b.meetingDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    <span className="font-medium text-gray-900 line-clamp-3">
                      {b.notes || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition-colors"
                      >
                        View LinkedIn
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MeetingVault
