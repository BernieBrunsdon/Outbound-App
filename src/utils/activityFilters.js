import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns'

/** Calendar YYYY-MM-DD from activity date (string, ISO, or Firestore Timestamp-like). */
export function ymdFromActivityDate(dateVal) {
  if (dateVal == null || dateVal === '') return ''
  if (typeof dateVal === 'string') return dateVal.split('T')[0]
  if (typeof dateVal.toDate === 'function') {
    const d = dateVal.toDate()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return String(dateVal).split('T')[0]
}

/** Stable local calendar day from stored activity date. */
export function localDayFromActivityDate(dateVal) {
  const ymd = ymdFromActivityDate(dateVal)
  if (!ymd) return null
  const parts = ymd.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null
  const [y, m, d] = parts
  return new Date(y, m - 1, d)
}

export function filterActivitiesByTimeView(activities, timeView, selectedDate) {
  const selectedYmd = ymdFromActivityDate(selectedDate)
  if (!selectedYmd) return []

  if (timeView === 'daily') {
    return activities.filter((a) => ymdFromActivityDate(a.date) === selectedYmd)
  }

  const selectedDay = localDayFromActivityDate(selectedYmd)
  if (!selectedDay) return []

  if (timeView === 'weekly') {
    const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDay, { weekStartsOn: 1 })
    return activities.filter((a) => {
      const activityDate = localDayFromActivityDate(a.date)
      if (!activityDate) return false
      return isWithinInterval(activityDate, { start: weekStart, end: weekEnd })
    })
  }

  const monthStart = startOfMonth(selectedDay)
  const monthEnd = endOfMonth(selectedDay)
  return activities.filter((a) => {
    const activityDate = localDayFromActivityDate(a.date)
    if (!activityDate) return false
    return isWithinInterval(activityDate, { start: monthStart, end: monthEnd })
  })
}
