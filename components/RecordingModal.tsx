import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface RecordingModalProps {
  visible: boolean;
  isTranscribing: boolean;
  transcribedText: string;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  isTranscribing,
  transcribedText,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // When the transcribed text prop updates, update our local state
  useEffect(() => {
    setContent(transcribedText);
  }, [transcribedText]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide a title and content.');
      return;
    }
    onSave(title, content);
    setTitle(''); // Reset for next time
    setContent('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <View style={styles.modalView}>
          {isTranscribing ? (
            <>
              <ActivityIndicator size="large" />
              <Text style={styles.statusText}>Transcribing your note...</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Save Your Note</Text>
              <TextInput
                style={styles.input}
                placeholder="Note Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder="Note Content"
                value={content}
                onChangeText={setContent}
                multiline
              />
              <View style={styles.buttonContainer}>
                <Button title="Cancel" onPress={onClose} color="red" />
                <Button title="Save" onPress={handleSave} />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top', // for Android
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default RecordingModal;