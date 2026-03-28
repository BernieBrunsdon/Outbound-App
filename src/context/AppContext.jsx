import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadDataFromStorage, saveDataToStorage, initializeDemoData } from '../utils/storage'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [activities, setActivities] = useState([])
  const [bookings, setBookings] = useState([])
  const activitiesRef = useRef([])
  const bookingsRef = useRef([])

  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData()
    // Load data from storage
    const data = loadDataFromStorage()
    const acts = data.activities || []
    const bks = data.bookings || []
    activitiesRef.current = acts
    bookingsRef.current = bks
    setActivities(acts)
    setBookings(bks)
  }, [])

  useEffect(() => {
    activitiesRef.current = activities
  }, [activities])

  useEffect(() => {
    bookingsRef.current = bookings
  }, [bookings])

  const saveActivity = (activity) => {
    setActivities(prev => {
      const updatedActivities = [...prev]
      const existingIndex = updatedActivities.findIndex(
        a => a.id === activity.id
      )

      if (existingIndex >= 0) {
        updatedActivities[existingIndex] = activity
      } else {
        updatedActivities.push(activity)
      }

      activitiesRef.current = updatedActivities
      saveDataToStorage({
        activities: updatedActivities,
        bookings: bookingsRef.current,
      })
      return updatedActivities
    })
  }

  const getActivitiesBySDR = (sdrId) => {
    return activities.filter(a => a.sdrId === sdrId)
  }

  const getAllActivities = () => {
    return activities
  }

  const getActivity = (sdrId, date) => {
    return activities.find(
      a => a.sdrId === sdrId && a.date === date
    )
  }

  const getBookingsForActivityDate = (sdrId, activityDate) => {
    return bookings.filter(
      b => b.sdrId === sdrId && b.activityDate === activityDate
    )
  }

  const getRecentBookingsForSDR = (sdrId, limit = 10) => {
    const list = bookings
      .filter(b => b.sdrId === sdrId)
      .sort((a, b) => {
        const da = a.meetingDate || a.createdAt || ''
        const db = b.meetingDate || b.createdAt || ''
        return db.localeCompare(da)
      })
    return list.slice(0, limit)
  }

  const saveBookingsForActivityDate = (sdrId, activityDate, records) => {
    setBookings(prev => {
      const without = prev.filter(
        b => !(b.sdrId === sdrId && b.activityDate === activityDate)
      )
      const next = [...without, ...records]
      bookingsRef.current = next
      saveDataToStorage({
        activities: activitiesRef.current,
        bookings: next,
      })
      return next
    })
  }

  const value = {
    activities,
    bookings,
    saveActivity,
    getActivitiesBySDR,
    getAllActivities,
    getActivity,
    getBookingsForActivityDate,
    getRecentBookingsForSDR,
    saveBookingsForActivityDate,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

