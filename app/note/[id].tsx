import React, { useState, useLayoutEffect } from 'react';
import { View, TextInput, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useNoteStore } from '../../store/noteStore';

const EditNoteScreen = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote, deleteNote } = useNoteStore();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit Note',
    });
  }, [navigation]);

  const handleUpdate = () => {
    if (!id) return;
    updateNote(id, title, content);
    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      "Delete Note",
      "Are you sure you want to permanently delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNote(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!note) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.inputTitle}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={styles.inputContent}
        value={content}
        onChangeText={setContent}
        placeholder="Content"
        multiline
      />
      <Button title="Save Changes" onPress={handleUpdate} />
      <View style={styles.deleteButtonContainer}>
        <Button title="Delete Note" color="red" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  inputTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  inputContent: {
    fontSize: 16,
    flex: 1,
    marginBottom: 24,
    minHeight: 200, // Give it some initial height
    textAlignVertical: 'top', // for Android
  },
  deleteButtonContainer: {
    marginTop: 20,
  },
});

export default EditNoteScreen;