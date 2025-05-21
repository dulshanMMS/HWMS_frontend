import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingPage from './components/DateBooking';
import FloorLayout from './components/FloorLayout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/floorlayout" element={<FloorLayout />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;