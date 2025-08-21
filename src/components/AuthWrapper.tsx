import React, { useState, useEffect } from 'react';
import WelcomePage from '@/pages/WelcomePage';
import AuthPage from '@/pages/AuthPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AppState = 'welcome' | 'auth' | 'authenticated' | 'loading';

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    // Check if user is already authenticated on this device
    const auth = localStorage.getItem('shahiGarageAuth');
    const authTime = localStorage.getItem('shahiGarageAuthTime');
    
    if (auth === 'true' && authTime) {
      // Check if authentication is still valid (24 hours)
      const authTimestamp = parseInt(authTime);
      const currentTime = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (currentTime - authTimestamp < twentyFourHours) {
        setAppState('authenticated');
      } else {
        // Authentication expired, clear it
        localStorage.removeItem('shahiGarageAuth');
        localStorage.removeItem('shahiGarageAuthTime');
        setAppState('welcome');
      }
    } else {
      setAppState('welcome');
    }
  }, []);

  const handleEnterGarage = () => {
    setAppState('auth');
  };

  const handleAuthenticated = () => {
    setAppState('authenticated');
  };

  const handleBackToWelcome = () => {
    setAppState('welcome');
  };

  // Show loading state while checking authentication
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show welcome page
  if (appState === 'welcome') {
    return <WelcomePage onEnterGarage={handleEnterGarage} />;
  }

  // Show auth page
  if (appState === 'auth') {
    return <AuthPage onAuthenticated={handleAuthenticated} onBackToWelcome={handleBackToWelcome} />;
  }

  // Show main app if authenticated
  return <>{children}</>;
};

export default AuthWrapper;
