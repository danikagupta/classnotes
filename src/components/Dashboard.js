import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Logout as LogoutIcon, NotificationsOutlined } from '@mui/icons-material';
import { fetchNotes } from '../redux/slices/notesSlice';
import { fetchUpcomingMeetings } from '../redux/slices/calendarSlice';
import { clearUser } from '../redux/slices/authSlice';
import NotesIcon from './notes/NotesIcon';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notes, loading: notesLoading } = useSelector((state) => state.notes);
  const { meetings, loading: meetingsLoading } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => {
    dispatch(fetchNotes());
    // Initial fetch for current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    dispatch(fetchUpcomingMeetings({ start, end }));
  }, [dispatch]);

  useEffect(() => {
    // Update recent notes when notes change
    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5);
    setRecentNotes(sortedNotes);
  }, [notes]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearUser());
    navigate('/login');
  };

  const handleEventClick = (info) => {
    const meeting = meetings.find(m => m.id === info.event.id);
    const note = notes.find(n => n.eventId === info.event.id);
    setSelectedEvent({ ...meeting, note });
  };

  const handleEditNote = (eventId) => {
    navigate(`/notes/${eventId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCalendarEvents = () => {
    return meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.summary,
      start: meeting.start.dateTime,
      end: meeting.end.dateTime,
      extendedProps: {
        hasNotes: notes.some(note => note.eventId === meeting.id)
      }
    }));
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meeting Notes
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setNotificationsAnchor(e.currentTarget)}
          >
            <NotificationsOutlined />
          </IconButton>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        PaperProps={{
          sx: { width: 350 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle1">Recent Notes</Typography>
        </MenuItem>
        {recentNotes.map((note) => (
          <MenuItem 
            key={note.id}
            onClick={() => {
              const meeting = meetings.find(m => m.eventId === note.eventId);
              setSelectedEvent({ ...meeting, note });
              setNotificationsAnchor(null);
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" noWrap>
                {note.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatNotificationDate(note.createdAt)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ height: 'calc(100vh - 200px)' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={getCalendarEvents()}
            eventClick={handleEventClick}
            datesSet={(info) => {
              console.log('Calendar dates changed:', {
                start: info.startStr,
                end: info.endStr,
                view: info.view.type
              });
              dispatch(fetchUpcomingMeetings({
                start: new Date(info.start),
                end: new Date(info.end)
              }));
            }}
            eventContent={(arg) => (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                width: '100%',
                overflow: 'hidden'
              }}>
                <Typography 
                  noWrap 
                  sx={{ 
                    flexGrow: 1,
                    fontSize: 'inherit',
                    lineHeight: 'inherit'
                  }}
                >
                  {arg.event.title}
                </Typography>
                {arg.event.extendedProps.hasNotes && 
                  <NotesIcon sx={{ flexShrink: 0, fontSize: '1rem' }} />}
              </Box>
            )}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            nowIndicator={true}
          />
        </Box>
      </Container>

      <Dialog 
        open={Boolean(selectedEvent)} 
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedEvent.summary}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {formatDate(selectedEvent.start.dateTime)} - {formatDate(selectedEvent.end.dateTime)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              {selectedEvent.note ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {selectedEvent.note.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                    Created by {selectedEvent.note.createdBy} on {formatDate(selectedEvent.note.createdAt)}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleEditNote(selectedEvent.id)}
                    sx={{ mt: 2 }}
                  >
                    Edit Note
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/notes/new?eventId=${selectedEvent.id}`)}
                >
                  Add Note
                </Button>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Dashboard;
