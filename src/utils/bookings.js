/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} sdrId
 * @property {string} activityDate - YYYY-MM-DD when the activity was logged
 * @property {string} prospectName
 * @property {string} prospectTitle
 * @property {string} companyName
 * @property {string} linkedinUrl
 * @property {string} meetingDate - YYYY-MM-DD scheduled meeting
 * @property {string} notes - reason for booking / quality context
 * @property {string} createdAt - ISO timestamp
 */

export function createEmptyBookingDraft() {
  return {
    prospectName: '',
    prospectTitle: '',
    companyName: '',
    linkedinUrl: '',
    meetingDate: '',
    notes: '',
  }
}

export function newBookingId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * @param {Partial<Booking>} draft
 * @param {string} sdrId
 * @param {string} activityDate
 * @returns {Booking}
 */
export function toBookingRecord(draft, sdrId, activityDate) {
  const id = draft.id || newBookingId()
  return {
    id,
    sdrId,
    activityDate,
    prospectName: (draft.prospectName || '').trim(),
    prospectTitle: (draft.prospectTitle || '').trim(),
    companyName: (draft.companyName || '').trim(),
    linkedinUrl: (draft.linkedinUrl || '').trim(),
    meetingDate: draft.meetingDate || '',
    notes: (draft.notes || '').trim(),
    createdAt: draft.createdAt || new Date().toISOString(),
  }
}

export function normalizeLinkedInUrl(url) {
  const t = (url || '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}
