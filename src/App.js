import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import { UserApplicationProvider } from './context/UserApplicationContext';
import { BookingProvider } from './context/BookingContext';
import AppRoutes from './routes';

import Navbar from './components/Navbar';

const AppLayout = () => {
  const location = useLocation();
  const publicPaths = ['/', '/login', '/signup'];
  const showGlobalNav = publicPaths.includes(location.pathname);
  
  return (
    <div className="app">
      {showGlobalNav && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <UserApplicationProvider>
          <BookingProvider>
            <Router>
              <AppLayout />
            </Router>
          </BookingProvider>
        </UserApplicationProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;
