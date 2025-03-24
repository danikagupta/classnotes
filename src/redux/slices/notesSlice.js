import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notes');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Failed to create note');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to update note');
      return { id, content };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notes: [],
  loading: false,
  error: null,
  currentNote: null,
};

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload;
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex((note) => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = {
            ...state.notes[index],
            ...action.payload,
          };
        }
      });
  },
});

export const { setCurrentNote, clearCurrentNote } = notesSlice.actions;

export default notesSlice.reducer;
