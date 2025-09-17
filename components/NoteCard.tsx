import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Note } from '../store/noteStore';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const handlePress = () => {
    router.push(`/note/${note.id}`);
  };
  return (
    <Pressable onPress={handlePress}>
      <View style={styles.card}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.content} numberOfLines={5}>
          {note.content}
        </Text>
        <Text style={styles.date}>
          {new Date(note.date).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default NoteCard;