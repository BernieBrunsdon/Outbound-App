// Simple localStorage-based data persistence

const STORAGE_KEY = 'sdr_activity_data'

export const loadDataFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return {
        activities: parsed.activities || [],
        bookings: parsed.bookings || [],
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
  return { activities: [], bookings: [] }
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

  const bookings = []
  const sampleMeeting = (sdrId, activityDate, meetingDate, prospectName, title, company, notes) => ({
    id: `demo-bk-${sdrId}-${meetingDate}-${prospectName.replace(/\s/g, '')}`,
    sdrId,
    activityDate,
    prospectName,
    prospectTitle: title,
    companyName: company,
    linkedinUrl: 'https://www.linkedin.com/in/example',
    meetingDate,
    notes,
    createdAt: new Date().toISOString(),
  })

  // Seed a few vault entries for first SDR so demo shows the table
  const d0 = today.toISOString().split('T')[0]
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const d7 = nextWeek.toISOString().split('T')[0]
  bookings.push(
    sampleMeeting(
      'sdr1',
      d0,
      d7,
      'Jordan Lee',
      'VP Sales',
      'Acme Corp',
      'Referred by existing customer; strong fit for outbound playbook.'
    ),
    sampleMeeting(
      'sdr1',
      d0,
      d7,
      'Sam Rivera',
      'Head of Growth',
      'Northwind',
      'Inbound demo request — budget confirmed for Q2.'
    )
  )

  saveDataToStorage({ activities, bookings })
}

