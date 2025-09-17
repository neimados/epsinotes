import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Required for uuid
import { v4 as uuidv4 } from 'uuid';
import * as Localization from 'expo-localization'; 

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
  selectedLanguage: string;
  addNote: (title: string, content: string) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  setSelectedLanguage: (language: string) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],

      selectedLanguage: Localization.getLocales()[0]?.languageCode || 'en',
      addNote: (title, content) => {
        const newNote: Note = {
          id: uuidv4(),
          title,
          content,
          date: new Date().toISOString(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      setSelectedLanguage: (language) => {
        console.log("Language set to:", language);
        set({ selectedLanguage: language });
      },
      updateNote: (id, title, content) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, title, content } : note
          ),
        }));
      },
    }),
    {
      name: 'epsinote-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
