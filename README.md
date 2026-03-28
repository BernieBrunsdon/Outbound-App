# SDR Activity Tracker

A clean, simple, and beautiful web app for tracking Sales Development Representative (SDR) activity. Built for sales teams who need visibility into daily call activity without the complexity of a full CRM.

## Features

- **6 SDR Profiles**: Each SDR has their own section with activity tracking
- **Role-Based Access**: 
  - SDRs see only their own data
  - Admin sees all SDRs with filtering options
- **Activity Tracking**: Track calls made, decision makers, voicemails, no answers, gatekeepers, follow-ups, and meetings booked
- **Automatic Totals**: Daily, weekly, and monthly totals calculated automatically
- **Time Views**: Toggle between daily, weekly, and monthly views
- **Beautiful Charts**: Visualize performance with modern, clean graphs
- **Performance Ranking**: Admin view shows who's performing best

## Tech Stack

- **React** with Vite
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Firebase Firestore** for real-time synced data
- **date-fns** for date handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Copy `.env.example` to `.env.local` and add your Firebase web app config (Project settings → Your apps).

5. Create Firestore collections `activities` and `bookings` (empty is fine). Deploy security rules appropriate for your org; the console will prompt you to add a **composite index** on `bookings` for `sdrId` + `activityDate` when you first save.

6. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

**SDR Users:**
- Email: `alex@company.com` (or any SDR email: jordan@company.com, sam@company.com, etc.)
- Password: `demo123`

**Admin User:**
- Email: `admin@company.com`
- Password: `admin123`

## Usage

### For SDRs

1. Log in with your SDR credentials
2. Select a date using the date picker
3. Enter your daily activity using the +/- buttons or direct input
4. Click "Save Activity" to save your data
5. View your totals and performance charts below

### For Admins

1. Log in with admin credentials
2. Toggle between "Individual" and "All SDRs" view
3. In Individual view: Select an SDR from the sidebar to view their stats
4. In All SDRs view: See team-wide totals, rankings, and comparisons
5. Use the time view toggle (Daily/Weekly/Monthly) and date picker to filter data

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy to any static hosting service.

## Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. Push to GitHub
3. Go to repository Settings > Pages
4. Select the `dist` folder as the source
5. Your app will be live at `https://yourusername.github.io/repository-name`

### Other Platforms

The built `dist` folder can be deployed to:
- Vercel
- Netlify
- AWS S3
- Any static hosting service

## Data storage

Activity and booking data live in **Cloud Firestore** and sync in real time. SDR logins only receive documents for their `sdrId`; admin receives the full `activities` and `bookings` collections.

## Project structure

```
src/
├── components/       # React components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Sidebar.jsx
│   ├── SDRView.jsx
│   ├── ActivityForm.jsx
│   ├── TotalsCard.jsx
│   ├── Charts.jsx
│   ├── MeetingVault.jsx
│   ├── AdminView.jsx
│   └── AdminAllView.jsx
├── context/         # React Context + Firestore listeners
│   └── AppContext.jsx
├── lib/
│   └── firebase.js  # Firebase init (env-based config)
├── utils/           # Utility functions
│   ├── bookings.js
│   └── constants.js
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Customization

### Adding More SDRs

Edit `src/utils/constants.js` and add to the `SDRS` array:

```javascript
{ id: 'sdr7', name: 'New SDR', email: 'newsdr@company.com', color: 'bg-yellow-500' }
```

### Changing Colors

The app uses Tailwind CSS. Modify colors in `tailwind.config.js` or use Tailwind's default color classes.

## License

This project is open source and available for use.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

