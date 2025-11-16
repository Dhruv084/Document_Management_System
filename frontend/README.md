# Frontend Application

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
VITE_BACKEND_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/      # Reusable components
│   ├── Layout.jsx
│   └── ProtectedRoute.jsx
├── pages/          # Page components
│   ├── auth/       # Authentication pages
│   └── dashboard/  # Dashboard pages
│       ├── admin/  # Admin dashboard pages
│       ├── faculty/# Faculty dashboard pages
│       └── student/# Student dashboard pages
├── utils/          # Utility functions
│   ├── api.js      # API client
│   └── auth.js     # Auth helpers
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Features

- React Router for navigation
- Protected routes based on user roles
- Tailwind CSS for styling
- Axios for API calls
- Toast notifications for user feedback

