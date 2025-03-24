import React, { useEffect } from 'react';
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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { fetchNotes } from '../redux/slices/notesSlice';
import { fetchUpcomingMeetings } from '../redux/slices/calendarSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notes, loading: notesLoading } = useSelector((state) => state.notes);
  const { meetings, loading: meetingsLoading } = useSelector((state) => state.calendar);

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

  return (
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
                      <ListItemText
                        primary={meeting.summary}
                        secondary={`${formatDate(meeting.start.dateTime)} - ${formatDate(
                          meeting.end.dateTime
                        )}`}
                      />
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
                  <React.Fragment key={note.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditNote(note.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={note.meetingMetadata.title}
                        secondary={formatDate(note.createdAt)}
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
  );
};

export default Dashboard;
