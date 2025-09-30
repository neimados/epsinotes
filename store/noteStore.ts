import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Required for uuid
import { v4 as uuidv4 } from 'uuid';
import * as Localization from 'expo-localization'; 

const pastelColors = [
  '#F9F9F9', // Very Light Mint
  '#FFF7F7', // Pale Pink
  '#F7F7FF', // Pale Lavender
  '#F7FFF7', // Pale Green
  '#FFFFF7', // Pale Yellow
  '#F7FDFF', // Very Light Blue
];

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color?: string;
}

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
        const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        const newNote: Note = {
          id: uuidv4(),
          title,
          content,
          date: new Date().toISOString(),
          color: randomColor,
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
