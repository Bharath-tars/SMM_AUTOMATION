import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Layout from './components/layout/Layout';

// Page components
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Posts from './pages/Posts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
// LinkedIn callback removed - using static data

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#0077b5', // LinkedIn blue
    },
    secondary: {
      main: '#00a0dc',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/posts" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Posts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;