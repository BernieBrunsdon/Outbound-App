import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  )
}

function timestampToIso(value) {
  if (value == null) return ''
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  if (typeof value === 'string') return value
  return String(value)
}

function mapActivityDocs(snapshot) {
  const list = []
  snapshot.forEach((d) => {
    const data = d.data()
    list.push({
      ...data,
      id: data.id || `${data.sdrId}-${data.date}`,
      sdrId: data.sdrId,
      date: data.date,
    })
  })
  return list
}

function mapBookingDocs(snapshot) {
  const list = []
  snapshot.forEach((d) => {
    const data = d.data()
    list.push({
      id: d.id,
      ...data,
      createdAt: timestampToIso(data.createdAt) || data.createdAt,
      updatedAt: data.updatedAt ? timestampToIso(data.updatedAt) : data.updatedAt,
    })
  })
  return list
}

export const AppProvider = ({ children, user }) => {
  const [activities, setActivities] = useState([])
  const [bookings, setBookings] = useState([])
  const [activitiesListenError, setActivitiesListenError] = useState(null)
  const [bookingsListenError, setBookingsListenError] = useState(null)

  useEffect(() => {
    if (!user?.id) return undefined

    setActivitiesListenError(null)
    setBookingsListenError(null)

    const activitiesColl = collection(db, 'activities')
    const activitiesQ =
      user.role === 'admin'
        ? activitiesColl
        : query(activitiesColl, where('sdrId', '==', user.id))

    const bookingsColl = collection(db, 'bookings')
    const bookingsQ =
      user.role === 'admin'
        ? bookingsColl
        : query(bookingsColl, where('sdrId', '==', user.id))

    const unsubActivities = onSnapshot(
      activitiesQ,
      (snap) => {
        setActivities(mapActivityDocs(snap))
        setActivitiesListenError(null)
      },
      (err) => setActivitiesListenError(err.message)
    )

    const unsubBookings = onSnapshot(
      bookingsQ,
      (snap) => {
        setBookings(mapBookingDocs(snap))
        setBookingsListenError(null)
      },
      (err) => setBookingsListenError(err.message)
    )

    return () => {
      unsubActivities()
      unsubBookings()
    }
  }, [user?.id, user?.role])

  const saveActivity = useCallback(async (activity) => {
    const docId = `${activity.sdrId}_${activity.date}`
    const ref = doc(db, 'activities', docId)
    const payload = stripUndefined({
      ...activity,
      id: activity.id || `${activity.sdrId}-${activity.date}`,
      sdrId: activity.sdrId,
      date: activity.date,
      updatedAt: serverTimestamp(),
    })
    await setDoc(ref, payload)
  }, [])

  const saveBookingsForActivityDate = useCallback(
    async (sdrId, activityDate, records) => {
      const q = query(
        collection(db, 'bookings'),
        where('sdrId', '==', sdrId),
        where('activityDate', '==', activityDate)
      )
      const existing = await getDocs(q)
      const batch = writeBatch(db)
      existing.forEach((d) => batch.delete(d.ref))

      records.forEach((rec) => {
        const ref = doc(db, 'bookings', rec.id)
        batch.set(
          ref,
          stripUndefined({
            ...rec,
            sdrId,
            activityDate,
            date: activityDate,
            updatedAt: serverTimestamp(),
          })
        )
      })

      await batch.commit()
    },
    []
  )

  const getActivitiesBySDR = useCallback(
    (sdrId) => activities.filter((a) => a.sdrId === sdrId),
    [activities]
  )

  const getAllActivities = useCallback(() => activities, [activities])

  const getActivity = useCallback(
    (sdrId, date) =>
      activities.find((a) => a.sdrId === sdrId && a.date === date),
    [activities]
  )

  const getBookingsForActivityDate = useCallback(
    (sdrId, activityDate) =>
      bookings.filter(
        (b) => b.sdrId === sdrId && b.activityDate === activityDate
      ),
    [bookings]
  )

  const getRecentBookingsForSDR = useCallback(
    (sdrId, limit = 10) => {
      const list = bookings
        .filter((b) => b.sdrId === sdrId)
        .sort((a, b) => {
          const da = a.meetingDate || a.createdAt || ''
          const db = b.meetingDate || b.createdAt || ''
          return db.localeCompare(da)
        })
      return list.slice(0, limit)
    },
    [bookings]
  )

  const firestoreError = activitiesListenError || bookingsListenError || null

  const value = useMemo(
    () => ({
      activities,
      bookings,
      firestoreError,
      activitiesListenError,
      bookingsListenError,
      saveActivity,
      getActivitiesBySDR,
      getAllActivities,
      getActivity,
      getBookingsForActivityDate,
      getRecentBookingsForSDR,
      saveBookingsForActivityDate,
    }),
    [
      activities,
      bookings,
      firestoreError,
      activitiesListenError,
      bookingsListenError,
      saveActivity,
      getActivitiesBySDR,
      getAllActivities,
      getActivity,
      getBookingsForActivityDate,
      getRecentBookingsForSDR,
      saveBookingsForActivityDate,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
