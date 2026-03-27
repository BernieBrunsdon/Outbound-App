export const SDRS = [
  { id: 'sdr1', name: 'Alex Morgan', email: 'alex@company.com', color: 'bg-blue-500' },
  { id: 'sdr2', name: 'Jordan Taylor', email: 'jordan@company.com', color: 'bg-purple-500' },
  { id: 'sdr3', name: 'Sam Chen', email: 'sam@company.com', color: 'bg-green-500' },
  { id: 'sdr4', name: 'Casey Williams', email: 'casey@company.com', color: 'bg-orange-500' },
  { id: 'sdr5', name: 'Riley Davis', email: 'riley@company.com', color: 'bg-pink-500' },
  { id: 'sdr6', name: 'Morgan Lee', email: 'morgan@company.com', color: 'bg-indigo-500' },
]

export const ADMIN_USER = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@company.com',
  role: 'admin',
}

// Demo SDR users for login
export const DEMO_USERS = [
  ...SDRS.map(sdr => ({ ...sdr, role: 'sdr', password: 'demo123' })),
  { ...ADMIN_USER, password: 'admin123' },
]

