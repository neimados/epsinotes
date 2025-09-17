import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Note } from '../store/noteStore';
import NoteCard from './NoteCard';

interface NoteListProps {
  notes: Note[]; // It will receive the notes array as a prop
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notes yet.</Text>
        <Text style={styles.emptySubText}>Tap the microphone to start!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      renderItem={({ item }) => <NoteCard note={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 8,
    paddingBottom: 150,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
  },
  emptySubText: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 8,
  },
});

export default NoteList;