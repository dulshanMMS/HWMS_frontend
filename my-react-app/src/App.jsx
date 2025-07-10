import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingPage from './components/DateBooking';
import FloorLayout from './components/FloorLayout';
import Login from './pages/Login'; 
import ErrorBoundary from './components/ErrorBoundary';



function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/datebooking" element={<BookingPage />} />
            <Route path="/floorlayout" element={<FloorLayout />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;