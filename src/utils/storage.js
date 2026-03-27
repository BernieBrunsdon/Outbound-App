// Simple localStorage-based data persistence

const STORAGE_KEY = 'sdr_activity_data'

export const loadDataFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
  return { activities: [] }
}

export const saveDataToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

export const initializeDemoData = () => {
  const existing = loadDataFromStorage()
  if (existing.activities && existing.activities.length > 0) {
    return // Data already exists
  }

  // Create some demo data for the last 7 days
  const activities = []
  const today = new Date()
  const sdrIds = ['sdr1', 'sdr2', 'sdr3', 'sdr4', 'sdr5', 'sdr6']

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    sdrIds.forEach((sdrId, index) => {
      activities.push({
        id: `${sdrId}-${date.toISOString().split('T')[0]}`,
        sdrId,
        date: date.toISOString().split('T')[0],
        callsMade: Math.floor(Math.random() * 50) + 20,
        decisionMakers: Math.floor(Math.random() * 15) + 5,
        voicemails: Math.floor(Math.random() * 20) + 5,
        noAnswer: Math.floor(Math.random() * 15) + 3,
        gatekeeper: Math.floor(Math.random() * 10) + 2,
        followUps: Math.floor(Math.random() * 8) + 2,
        meetingsBooked: Math.floor(Math.random() * 5) + 1,
      })
    })
  }

  saveDataToStorage({ activities })
}

