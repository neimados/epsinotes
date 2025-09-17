import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Alert,
} from 'react-native';
import NoteList from '../components/NoteList';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/openai';
import RecordingModal from '../components/RecordingModal';
import { useNoteStore } from '../store/noteStore';
import { FontAwesome5 } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

export default function HomeScreen() {
    const { isRecording, recordingUri, startRecording, stopRecording } = useAudioRecorder();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const addNote = useNoteStore((state) => state.addNote);

    useEffect(() => {
        if (recordingUri) {
            handleTranscription(recordingUri);
        }
    }, [recordingUri]);

    const handleTranscription = async (uri: string) => {
        setIsModalVisible(true);
        setIsTranscribing(true);
        try {
            const result = await transcribeAudio(uri);
            setTranscribedText(result);
        } catch (error) {
            Alert.alert('Transcription Error', 'Failed to transcribe the audio.');
            closeModal();
        } finally {
            setIsTranscribing(false);
            // 2. Add a cleanup step in the 'finally' block
            // This ensures the file is deleted even if the transcription fails.
            try {
                await FileSystem.deleteAsync(uri);
                console.log('Recording file deleted:', uri);
            } catch (deleteError) {
                console.error('Failed to delete recording file:', deleteError);
            }
        }
    };

    const handleSaveNote = (title: string, content: string) => {
        addNote(title, content);
        closeModal();
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setTranscribedText('');
    };

    const handleRecordButtonPress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <View style={styles.container}>
            <NoteList />

            {isRecording && (
                <View style={styles.recordingIndicator}>
                    <FontAwesome5 name="microphone-alt" size={24} color="red" />
                    <Text style={styles.recordingText}>Recording...</Text>
                </View>
            )}

            <TouchableOpacity style={styles.fab} onPress={handleRecordButtonPress}>
                <FontAwesome5 name="microphone" size={28} color="white" />
            </TouchableOpacity>

            <RecordingModal
                visible={isModalVisible}
                isTranscribing={isTranscribing}
                transcribedText={transcribedText}
                onClose={closeModal}
                onSave={handleSaveNote}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 30,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { height: 5, width: 0 },
    },
    recordingIndicator: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    recordingText: {
        marginLeft: 10,
        color: 'red',
        fontSize: 16,
    }
});