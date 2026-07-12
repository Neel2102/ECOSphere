# ECOSphere - React + Express Application

A full-stack application with React frontend and Express backend.

## Project Structure

```
ECOSphere/
├── backend/          # Express API server
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── .env          # Environment variables
├── frontend/         # React application
│   ├── src/          # React source files
│   ├── public/       # Public assets
│   └── package.json  # Frontend dependencies
└── README.md         # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following:
```
PORT=5000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend Server

From the backend directory:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Development Server

From the frontend directory (in a new terminal):
```bash
npm start
```

The React application will run on `http://localhost:3000`

## API Endpoints

- `GET /` - Returns a welcome message
- `GET /api/health` - Health check endpoint

## Features

- React 18 with modern hooks
- Express.js REST API
- CORS enabled for cross-origin requests
- Environment variable configuration
- Hot module replacement in development

## Development

### Backend Development

The backend uses `nodemon` for auto-reloading during development.

### Frontend Development

The frontend uses Create React App with hot module replacement.

## Building for Production

### Frontend Build

From the frontend directory:
```bash
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

## License

ISC
