import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPages from './components/AuthPages';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // This will track if user is logged in (we'll make this real later with backend)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* If not logged in, show auth page */}
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <AuthPages setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        
        {/* Dashboard - protected route */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
            <Navigate to="/auth" />
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;