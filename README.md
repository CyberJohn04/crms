# Car Rental Management System

A comprehensive car rental management system built with React.js, featuring user authentication, booking management, payment processing, and a modern responsive design.

## Features

- User Authentication (Login/Signup)
- Browse Available Cars
- Make Bookings
- View/Manage Bookings
- Return Processing
- Payment Processing
- User Profile Management
- Dashboard with Statistics

## Tech Stack

- **Frontend**: React.js 18
- **Routing**: React Router DOM 6
- **Styling**: CSS3
- **State Management**: React Context API

## Project Structure

```
car-rental-system/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── car1.jpg
│   │   │   ├── car2.jpg
│   │   │   └── car3.jpg
│   │   └── css/
│   │       └── custom.css
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── CarCard.js
│   │   └── Sidebar.js
│   ├── pages/
│   │   ├── LandingPage.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Dashboard.js
│   │   ├── MyBookings.js
│   │   ├── MyReturns.js
│   │   ├── Payments.js
│   │   └── Profile.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── carService.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── App.js
│   ├── index.js
│   └── routes.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App

## License

ISC

