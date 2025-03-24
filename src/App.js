import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Login from './components/auth/Login';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/Dashboard';
import NotesEditor from './components/notes/NotesEditor';

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
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      WebSocketService.connect();
    }
    return () => WebSocketService.disconnect();
  }, [isAuthenticated]);

  if (loading) {
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
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/notes/:id"
            element={isAuthenticated ? <NotesEditor /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
