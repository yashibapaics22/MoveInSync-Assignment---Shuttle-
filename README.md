# Shuttle Management System

A full stack MERN application for managing shuttle services, bookings, routes, and locations.

## Features

- User authentication and authorization
- User/Admin roles with different permissions
- Shuttle route management
- Location management
- Booking system for shuttle services
- Booking status tracking

## Technology Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Express Validator

### Frontend
- React
- React Router
- React Context API for state management
- Axios for API requests

## Installation

### Requirements
- Node.js
- MongoDB

### Setup

1. Clone the repository
```
git clone <repository-url>
cd yashi-shuttle
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd frontend
npm install
```

4. Create a default.json file in the backend/config folder with the following:
```
{
  "mongoURI": "your_mongodb_connection_string",
  "jwtSecret": "your_jwt_secret"
}
```

## Running the Application

### Development Mode

1. Start the backend server:
```
cd backend
npm run server
```

2. Start the frontend development server:
```
cd frontend
npm start
```

3. Or run both concurrently:
```
cd backend
npm run dev
```

### Production Mode

1. Build the frontend:
```
cd frontend
npm run build
```

2. Set environment variables on your server
3. Run the Node.js server:
```
cd backend
npm start
```

## API Endpoints

### Authentication
- POST /api/auth - Login user
- GET /api/auth - Get logged in user

### Users
- POST /api/users - Register a new user
- GET /api/users - Get all users (admin only)
- PUT /api/users/:id - Update user (admin only)

### Locations
- GET /api/locations - Get all locations
- POST /api/locations - Add new location (admin only)
- PUT /api/locations/:id - Update location (admin only)
- DELETE /api/locations/:id - Delete location (admin only)

### Routes
- GET /api/routes - Get all routes
- POST /api/routes - Add new route (admin only)
- PUT /api/routes/:id - Update route (admin only)
- DELETE /api/routes/:id - Delete route (admin only)

### Bookings
- GET /api/bookings - Get user bookings or all bookings (admin)
- POST /api/bookings - Create a booking
- PUT /api/bookings/:id - Update booking status (admin only)
- DELETE /api/bookings/:id - Delete booking

## License

This project is licensed under the MIT License 