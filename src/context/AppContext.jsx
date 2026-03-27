import { createContext, useContext, useState, useEffect } from 'react'
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

  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData()
    // Load data from storage
    const data = loadDataFromStorage()
    setActivities(data.activities || [])
  }, [])

  const saveActivity = (activity) => {
    const updatedActivities = [...activities]
    const existingIndex = updatedActivities.findIndex(
      a => a.id === activity.id
    )

    if (existingIndex >= 0) {
      updatedActivities[existingIndex] = activity
    } else {
      updatedActivities.push(activity)
    }

    setActivities(updatedActivities)
    saveDataToStorage({ activities: updatedActivities })
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

  const value = {
    activities,
    saveActivity,
    getActivitiesBySDR,
    getAllActivities,
    getActivity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

