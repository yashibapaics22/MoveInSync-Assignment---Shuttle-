# Shuttle Management System - Frontend

This is the frontend application for the Shuttle Management System, built with React.

## Features

- User authentication (login/register)
- Dashboard with quick booking and wallet information
- Book rides on available routes
- View trip history
- Manage wallet and payments
- Admin panel for managing students and routes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the frontend directory
```bash
cd shuttle/frontend
```

3. Install dependencies
```bash
npm install
```

4. Create a .env file in the frontend directory with the following content (adjust as needed):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Build for Production

Create a production build:
```bash
npm run build
```

## Project Structure

```
frontend/
├── public/               # Static files
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Application pages
│   ├── services/         # API services
│   ├── App.js            # Main application component
│   └── index.js          # Application entry point
└── package.json          # Project dependencies and scripts
```

## Main Components

- **Authentication**: Login and registration functionality
- **Dashboard**: Overview of user's activity and quick actions
- **Booking System**: Interface for booking shuttle rides
- **Wallet**: Managing user balance and payments
- **Admin Panel**: Administrative features for managing the system

## API Integration

The frontend communicates with the backend through RESTful API endpoints defined in the `services` directory.

## Technology Stack

- React
- React Router for navigation
- Axios for API requests 