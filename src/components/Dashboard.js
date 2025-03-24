import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Box,
  Divider,
  Stack,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { fetchNotes } from '../redux/slices/notesSlice';
import { fetchUpcomingMeetings } from '../redux/slices/calendarSlice';
import { clearUser } from '../redux/slices/authSlice';
import NotesIcon from './notes/NotesIcon';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notes, loading: notesLoading } = useSelector((state) => state.notes);
  const { meetings, loading: meetingsLoading } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearUser());
    navigate('/login');
  };

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchUpcomingMeetings());
  }, [dispatch]);

  const handleEditNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getExistingNote = (eventId) => {
    return notes.find(note => note.eventId === eventId);
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meeting Notes
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Upcoming Meetings */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              overflow: 'auto',
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Upcoming Meetings
            </Typography>
            {meetingsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                Loading...
              </Box>
            ) : (
              <List>
                {meetings.map((meeting) => (
                  <React.Fragment key={meeting.id}>
                    <ListItem>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                        <ListItemText
                          primary={meeting.summary}
                          secondary={`${formatDate(meeting.start.dateTime)} - ${formatDate(
                            meeting.end.dateTime
                          )}`}
                          sx={{ flex: 1 }}
                        />
                        <NotesIcon
                          eventId={meeting.id}
                          userEmail={user.email}
                          existingNote={getExistingNote(meeting.id)}
                        />
                      </Stack>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Notes */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              overflow: 'auto',
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Notes
            </Typography>
            {notesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                Loading...
              </Box>
            ) : (
              <List>
                {notes.map((note) => (
                  <React.Fragment key={note.eventId}>
                    <ListItem
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <NotesIcon
                            eventId={note.eventId}
                            userEmail={user.email}
                            existingNote={note}
                          />
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleEditNote(note.eventId)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')}
                        secondary={formatDate(note.updatedAt)}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
    </>
  );
};

export default Dashboard;
