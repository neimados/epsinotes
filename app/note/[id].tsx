import React, { useState, useLayoutEffect } from 'react';
import { View, TextInput, StyleSheet, Button, Alert, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useNoteStore } from '../../store/noteStore';
import { FontAwesome } from '@expo/vector-icons';

const EditNoteScreen = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote, deleteNote } = useNoteStore();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  const handleShare = async () => {
    if (!note) return;
    try {
      const noteText = `EpsiNotes : ${title}\n\n${content}`;
      
      await Share.share({
        message: noteText,
      });
    } catch (error) {
      Alert.alert("Error", "There was an error trying to share your note.");
    }
  };

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
    <View style={styles.container}>
      <ScrollView>
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
      <TouchableOpacity style={styles.shareFab} onPress={handleShare}>
        <FontAwesome name="share-square-o" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
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
  shareFab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.2,
    shadowOffset: { height: 4, width: 0 },
  },
});

export default EditNoteScreen;