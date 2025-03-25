import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from './redux/slices/authSlice';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Login from './components/auth/Login';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/Dashboard';
import NotesEditor from './components/notes/NotesEditor';
import UserManagement from './components/admin/UserManagement';
import AllNotes from './components/admin/AllNotes';
import Navigation from './components/common/Navigation';

// Services
import WebSocketService from './services/websocket';

// Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const isOwner = user?.role === 'OWNER';

  useEffect(() => {
    const checkExistingToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            dispatch(setUser(data.user));
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
        }
      }
      setInitialCheckDone(true);
    };

    checkExistingToken();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      WebSocketService.connect();
    }
    return () => WebSocketService.disconnect();
  }, [isAuthenticated]);

  if (loading || !initialCheckDone) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route path="/auth/google/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Box>
                  <Navigation />
                  <Box sx={{ p: 3 }}>
                    <Dashboard />
                  </Box>
                </Box>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/notes/new"
            element={
              isAuthenticated ? (
                <Box>
                  <Navigation />
                  <Box sx={{ p: 3 }}>
                    <NotesEditor />
                  </Box>
                </Box>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/notes/:id"
            element={
              isAuthenticated ? (
                <Box>
                  <Navigation />
                  <Box sx={{ p: 3 }}>
                    <NotesEditor />
                  </Box>
                </Box>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {isAdmin && (
            <Route
              path="/admin/notes"
              element={
                isAuthenticated ? (
                  <Box>
                    <Navigation />
                    <Box sx={{ p: 3 }}>
                      <AllNotes />
                    </Box>
                  </Box>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          )}
          {isOwner && (
            <Route
              path="/admin/users"
              element={
                isAuthenticated ? (
                  <Box>
                    <Navigation />
                    <Box sx={{ p: 3 }}>
                      <UserManagement />
                    </Box>
                  </Box>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          )}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
