import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Required for uuid
import { v4 as uuidv4 } from 'uuid';

// Define the shape of a single note
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

// Define the shape of our store's state and actions
interface NoteState {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  deleteNote: (id: string) => void;
  // loadNotes is handled automatically by the persist middleware
}

export const useNoteStore = create<NoteState>()(
  // The 'persist' middleware automatically saves the store's state
  // to AsyncStorage whenever it changes.
  persist(
    (set) => ({
      // Initial state
      notes: [],

      // Action to add a new note
      addNote: (title, content) => {
        const newNote: Note = {
          id: uuidv4(), // Generate a unique ID
          title,
          content,
          date: new Date().toISOString(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
      },

      // Action to delete a note by its ID
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
    }),
    {
      name: 'echonote-storage', // Unique name for storage
      storage: createJSONStorage(() => AsyncStorage), // Specify AsyncStorage as the storage medium
    }
  )
);
