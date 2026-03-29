import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const DEMO_SDRS = [
  { id: 'sdr1', name: 'Alex Morgan', accountName: 'Northwind Labs', volume: 1.0 },
  { id: 'sdr2', name: 'Jordan Taylor', accountName: 'Sterling Commerce', volume: 0.72 },
  { id: 'sdr3', name: 'Sam Chen', accountName: 'Blue River SaaS', volume: 0.6 },
]

const TITLES = [
  'VP Revenue',
  'Head of Sales',
  'Director of Growth',
  'Chief Commercial Officer',
  'Founder',
  'VP Marketing',
  'Head of Demand Gen',
  'Sales Operations Director',
]

const COMPANIES = [
  'Brightline AI',
  'Nimbus Metrics',
  'ForgeOps',
  'Helix Commerce',
  'SummitCloud',
  'PulseData',
  'VertexIQ',
  'NorthPeak',
  'KiteStack',
  'RevPilot',
  'AtlasFlow',
  'SignalBeam',
  'PrimeLayer',
  'BlueRidge Tech',
]

const FIRST_NAMES = [
  'Amelia',
  'Ethan',
  'Olivia',
  'Noah',
  'Mia',
  'Liam',
  'Ava',
  'Lucas',
  'Sofia',
  'Mason',
  'Grace',
  'Henry',
  'Ella',
  'Leo',
  'Ruby',
]

const LAST_NAMES = [
  'Hughes',
  'Walker',
  'Simmons',
  'Patel',
  'Khan',
  'Coleman',
  'Murray',
  'Bennett',
  'Fisher',
  'Shaw',
  'Reed',
  'Brooks',
  'Santos',
  'Ward',
  'Baker',
]

const NOTE_TEMPLATES = [
  'Currently evaluating outbound partners to increase qualified demos before next quarter planning.',
  'Interested in improving show rates from founder-led outbound and scaling with a dedicated SDR pod.',
  'Shared specific pain around low reply quality; open to pilot after internal budget sign-off.',
  'Wants tighter account targeting and stronger DM connect rates in enterprise segments.',
  'Confirmed buying committee size and timeline; follow-up meeting requested with sales leadership.',
  'Actively benchmarking agencies and asked for examples from similar B2B SaaS growth stage.',
]

function readEnvFile(envPath) {
  const raw = fs.readFileSync(envPath, 'utf8')
  const out = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    out[key] = value
  }
  return out
}

function parseMonthArg() {
  const monthArg = process.argv.find((a) => a.startsWith('--month='))?.split('=')[1]
  if (monthArg) {
    if (!/^\d{4}-\d{2}$/.test(monthArg)) {
      throw new Error(`Invalid --month value "${monthArg}". Use YYYY-MM.`)
    }
    return monthArg
  }
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function seededRandom(seed) {
  let t = seed + 0x6d2b79f5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function hashString(input) {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function monthWeekdays(month) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  const out = []
  while (d.getMonth() === m - 1) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) {
      out.push(formatYmd(d))
    }
    d.setDate(d.getDate() + 1)
  }
  return out
}

function formatYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(ymd, days) {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return formatYmd(date)
}

function buildDailyActivity({ sdrId, date, volume, meetingBias }) {
  const seed = hashString(`${sdrId}_${date}`)
  const r1 = seededRandom(seed + 11)
  const r2 = seededRandom(seed + 29)
  const r3 = seededRandom(seed + 53)
  const r4 = seededRandom(seed + 97)
  const r5 = seededRandom(seed + 151)

  const callsMade = Math.round(clamp((18 + r1 * 24) * volume, 8, 60))
  const emailsSent = Math.round(clamp((8 + r2 * 14) * volume, 3, 40))
  const linkedinTouches = Math.round(clamp((2 + r3 * 8) * volume, 1, 18))
  const decisionMakers = Math.round(
    clamp((callsMade * (0.16 + r4 * 0.2)) + (emailsSent * 0.03), 2, 22)
  )
  const followUps = Math.round(clamp((3 + r5 * 7) * volume, 1, 14))

  const meetingsBooked = Math.round(
    clamp((decisionMakers * (0.13 + meetingBias * 0.08)) + seededRandom(seed + 211) * 1.8, 0, 4)
  )
  const attendanceFactor = 0.62 + seededRandom(seed + 307) * 0.28
  const meetingsAttended = Math.min(
    meetingsBooked,
    Math.round(meetingsBooked * attendanceFactor)
  )

  return {
    callsMade,
    emailsSent,
    linkedinTouches,
    decisionMakers,
    followUps,
    meetingsBooked,
    meetingsAttended,
  }
}

function applyAlexShowrateTarget(activity, dayIndex, totalWeekdays) {
  const targetBooked = Math.min(22, totalWeekdays)
  const targetAttendedTotal = targetBooked * 0.713
  const wholeAttendedDays = Math.floor(targetAttendedTotal)
  const attendedRemainder = Number((targetAttendedTotal - wholeAttendedDays).toFixed(3))

  const isBookedDay = dayIndex < targetBooked
  if (!isBookedDay) {
    activity.meetingsBooked = 0
    activity.meetingsAttended = 0
    return activity
  }

  activity.meetingsBooked = 1
  if (dayIndex < wholeAttendedDays) {
    activity.meetingsAttended = 1
  } else if (dayIndex === wholeAttendedDays && attendedRemainder > 0) {
    activity.meetingsAttended = attendedRemainder
  } else {
    activity.meetingsAttended = 0
  }
  return activity
}

function pickFrom(list, seed) {
  return list[Math.floor(seededRandom(seed) * list.length)]
}

function makeBooking({ sdr, activityDate, index }) {
  const seedBase = hashString(`${sdr.id}_${activityDate}_${index}`)
  const first = pickFrom(FIRST_NAMES, seedBase + 7)
  const last = pickFrom(LAST_NAMES, seedBase + 17)
  const company = pickFrom(COMPANIES, seedBase + 31)
  const title = pickFrom(TITLES, seedBase + 47)
  const note = pickFrom(NOTE_TEMPLATES, seedBase + 61)
  const meetingDate = addDays(activityDate, 3 + Math.floor(seededRandom(seedBase + 89) * 8))
  const slug = `${first}.${last}`.toLowerCase()

  return {
    id: `${sdr.id}_${activityDate}_booking_${index + 1}`,
    sdrId: sdr.id,
    activityDate,
    date: activityDate,
    prospectName: `${first} ${last}`,
    prospectTitle: title,
    companyName: company,
    linkedinUrl: `https://www.linkedin.com/in/${slug}`,
    meetingDate,
    notes: note,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

async function commitInChunks(db, ops, label) {
  const CHUNK_SIZE = 400
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db)
    const chunk = ops.slice(i, i + CHUNK_SIZE)
    for (const op of chunk) {
      if (op.type === 'delete') batch.delete(op.ref)
      if (op.type === 'set') batch.set(op.ref, op.data)
    }
    await batch.commit()
  }
  console.log(`${label}: ${ops.length} operations`)
}

async function main() {
  const month = parseMonthArg()
  const envPath = path.join(projectRoot, '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.local in project root.')
  }
  const env = readEnvFile(envPath)

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  }

  for (const key of ['apiKey', 'projectId', 'appId']) {
    if (!firebaseConfig[key]) throw new Error(`Missing Firebase config value: ${key}`)
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const weekdays = monthWeekdays(month)
  const monthPrefix = `${month}-`

  console.log(`Seeding demo data for ${month} (${weekdays.length} weekdays)...`)
  console.log(`SDRs: ${DEMO_SDRS.map((s) => `${s.name} (${s.id})`).join(', ')}`)

  const deleteOps = []
  for (const sdr of DEMO_SDRS) {
    const actSnap = await getDocs(query(collection(db, 'activities'), where('sdrId', '==', sdr.id)))
    actSnap.forEach((d) => {
      const row = d.data()
      const date = String(row.date || '')
      if (date.startsWith(monthPrefix)) {
        deleteOps.push({ type: 'delete', ref: d.ref })
      }
    })

    const bookingSnap = await getDocs(query(collection(db, 'bookings'), where('sdrId', '==', sdr.id)))
    bookingSnap.forEach((d) => {
      const row = d.data()
      const activityDate = String(row.activityDate || row.date || '')
      if (activityDate.startsWith(monthPrefix)) {
        deleteOps.push({ type: 'delete', ref: d.ref })
      }
    })
  }
  if (deleteOps.length > 0) {
    await commitInChunks(db, deleteOps, 'Cleanup complete')
  } else {
    console.log('Cleanup complete: no existing docs for target month')
  }

  const setOps = []
  let bookingsCount = 0
  let meetingsBookedTotal = 0
  let meetingsAttendedTotal = 0

  for (const sdr of DEMO_SDRS) {
    for (let dayIndex = 0; dayIndex < weekdays.length; dayIndex++) {
      const date = weekdays[dayIndex]
      const activity = buildDailyActivity({
        sdrId: sdr.id,
        date,
        volume: sdr.volume,
        meetingBias: sdr.id === 'sdr1' ? 1 : sdr.id === 'sdr2' ? 0.9 : 0.8,
      })
      if (sdr.id === 'sdr1') {
        applyAlexShowrateTarget(activity, dayIndex, weekdays.length)
      }

      const activityRef = doc(db, 'activities', `${sdr.id}_${date}`)
      setOps.push({
        type: 'set',
        ref: activityRef,
        data: {
          id: `${sdr.id}-${date}`,
          sdrId: sdr.id,
          date,
          ...activity,
          updatedAt: serverTimestamp(),
          seededDemo: true,
          seededMonth: month,
          accountName: sdr.accountName,
        },
      })

      meetingsBookedTotal += activity.meetingsBooked
      meetingsAttendedTotal += activity.meetingsAttended

      for (let i = 0; i < activity.meetingsBooked; i++) {
        const booking = makeBooking({ sdr, activityDate: date, index: i })
        const bookingRef = doc(db, 'bookings', booking.id)
        setOps.push({ type: 'set', ref: bookingRef, data: booking })
        bookingsCount++
      }
    }
  }

  await commitInChunks(db, setOps, 'Seed complete')
  console.log('\nDone.')
  console.log(`Activities written: ${weekdays.length * DEMO_SDRS.length}`)
  console.log(`Bookings written: ${bookingsCount}`)
  console.log(`Meetings booked (month): ${meetingsBookedTotal}`)
  console.log(`Meetings attended (month): ${meetingsAttendedTotal}`)
  console.log(
    `Show rate: ${
      meetingsBookedTotal > 0
        ? `${Math.round((meetingsAttendedTotal / meetingsBookedTotal) * 1000) / 10}%`
        : '—'
    }`
  )
}

main().catch((err) => {
  console.error('\nSeed failed:')
  console.error(err?.message || err)
  process.exit(1)
})
