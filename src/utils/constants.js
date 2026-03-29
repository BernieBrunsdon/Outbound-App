/** SDRs assigned to the client cell (1–3 typical); used for aggregated client overview */
export const CLIENT_CELL_SDR_IDS = ['sdr1', 'sdr2', 'sdr3']

export const SDRS = [
  {
    id: 'sdr1',
    name: 'Alex Morgan',
    email: 'alex@company.com',
    color: 'bg-blue-500',
    accountName: 'Northwind Labs (Demo)',
  },
  {
    id: 'sdr2',
    name: 'Jordan Taylor',
    email: 'jordan@company.com',
    color: 'bg-purple-500',
    accountName: 'Sterling Commerce (Demo)',
  },
  {
    id: 'sdr3',
    name: 'Sam Chen',
    email: 'sam@company.com',
    color: 'bg-green-500',
    accountName: 'Blue River SaaS (Demo)',
  },
  {
    id: 'sdr4',
    name: 'Casey Williams',
    email: 'casey@company.com',
    color: 'bg-orange-500',
    accountName: 'Vertex Analytics (Demo)',
  },
  {
    id: 'sdr5',
    name: 'Riley Davis',
    email: 'riley@company.com',
    color: 'bg-pink-500',
    accountName: 'Helix Data Co. (Demo)',
  },
  {
    id: 'sdr6',
    name: 'Morgan Lee',
    email: 'morgan@company.com',
    color: 'bg-indigo-500',
    accountName: 'Catalyst Health (Demo)',
  },
]

export const ADMIN_USER = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@company.com',
  role: 'admin',
}

/** Demo client: same OG Pulse experience as cell overview (read-only). */
export const CLIENT_DEMO_USER = {
  id: 'client-demo',
  name: 'Client (demo)',
  email: 'client@outboundgrowth.demo',
  role: 'client',
  password: 'demo123',
}

// Demo users for login
export const DEMO_USERS = [
  ...SDRS.map((sdr) => ({ ...sdr, role: 'sdr', password: 'demo123' })),
  CLIENT_DEMO_USER,
  { ...ADMIN_USER, password: 'admin123' },
]
