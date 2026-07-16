import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthPages from './components/AuthPages';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(null); // null | 'login' | 'signup'

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const appContent = (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {!isAuthenticated && !showAuth ? (
        <LandingPage setIsAuthenticated={handleAuth} setShowAuth={setShowAuth} />
      ) : !isAuthenticated ? (
        <AuthPages setIsAuthenticated={handleAuth} initialPage={showAuth} />
      ) : (
        <Dashboard setIsAuthenticated={handleLogout} />
      )}
    </div>
  );

  return (
    <ErrorBoundary>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {appContent}
        </GoogleOAuthProvider>
      ) : appContent}
    </ErrorBoundary>
  );
}

export default App;