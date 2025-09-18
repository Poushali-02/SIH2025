import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import type { User } from './types/auth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to='/login' replace />;
};

// Auth Route Component (redirects to dashboard if already logged in)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to='/dashboard' replace /> : <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (user: User) => {
    login(user);
  };

  const handleSignup = (user: User) => {
    login(user);
  };

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <Router>
      <div className='App'>
        <Routes>
          {/* Auth Routes */}
          <Route
            path='/login'
            element={
              <AuthRoute>
                {isLogin ? (
                  <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
                ) : (
                  <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />
                )}
              </AuthRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path='/' element={<Navigate to='/login' replace />} />

          {/* Catch all route */}
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Main App with Auth Provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
