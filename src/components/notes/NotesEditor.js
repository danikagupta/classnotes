import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { updateNote } from '../../redux/slices/notesSlice';

const NotesEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { notes } = useSelector((state) => state.notes);
  const currentNote = notes.find((note) => note.id === id);

  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content);
    }
  }, [currentNote]);

  const handleSave = async () => {
    try {
      await dispatch(updateNote({ id, content })).unwrap();
      // Show success message or notification
    } catch (error) {
      console.error('Failed to save note:', error);
      // Show error message
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  if (!currentNote) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Note not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back
        </Button>
        <Typography variant="h5" component="h1">
          {currentNote.meetingMetadata?.title || 'Meeting Notes'}
        </Typography>
        <IconButton
          onClick={() => setShowHistory(!showHistory)}
          color={showHistory ? 'primary' : 'default'}
        >
          <HistoryIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={showHistory ? 8 : 12}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              placeholder="Enter your notes here..."
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          </Paper>
        </Grid>

        {showHistory && (
          <Grid item xs={4}>
            <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Version History
              </Typography>
              <List>
                {currentNote.versions?.map((version, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={formatDate(version.timestamp)}
                        secondary={`Edited by: ${version.editor}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default NotesEditor;
