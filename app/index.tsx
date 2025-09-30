import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigation } from 'expo-router';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import NoteList from '../components/NoteList';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio, categorizeOrTitleNote } from '../services/openai';
import { useNoteStore } from '../store/noteStore';
import { FontAwesome5 } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import LanguageModal from '../components/LanguageModal';
import * as Haptics from 'expo-haptics';
import i18n from '../i18n';

const getFlagEmoji = (langCode: string) => {
    const flags: { [key: string]: string } = {
        en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹', zh: '🇨🇳', ko: '🇰🇷',
    };
    return flags[langCode] || '🏳️';
};

export default function HomeScreen() {
    const navigation = useNavigation();
    const { isRecording, recordingUri, startRecording, stopRecording } = useAudioRecorder();
    const { notes, addNote, updateNote, selectedLanguage, setSelectedLanguage } = useNoteStore();
    const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const pressStartTime = useRef(0);

    const handlePressIn = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        startRecording();
    };

    const handlePressOut = async () => {
        const result = await stopRecording(); // The hook now tells us the result
        if (result.success) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(
                i18n.t('holdToRecordTitle'), 
                i18n.t('holdToRecordMessage')
            );
        }
    };

    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) {
            return notes; // If search is empty, return all notes
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return notes.filter(
            (note) =>
                note.title.toLowerCase().includes(lowercasedQuery) ||
                note.content.toLowerCase().includes(lowercasedQuery)
        );
    }, [notes, searchQuery]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setLanguageModalVisible(true)}
                    style={{ paddingHorizontal: 15 }}
                >
                    <Text style={{ fontSize: 28 }}>{getFlagEmoji(selectedLanguage)}</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, selectedLanguage]);

    useEffect(() => {
        if (recordingUri) {
            handleAutoNoteCreation(recordingUri);
        }
    }, [recordingUri]);

    const handleAutoNoteCreation = async (uri: string) => {
        setIsProcessing(true);
        try {
            const transcribedText = await transcribeAudio(uri, selectedLanguage);
            if (!transcribedText.trim()) {
                Alert.alert("Transcription Empty", "Could not detect any speech.");
                return;
            }

            const aiDecision = await categorizeOrTitleNote(transcribedText, notes);

            if (aiDecision.action === 'UPDATE' && aiDecision.noteId) {
                const noteToUpdate = notes.find(n => n.id === aiDecision.noteId);
                if (noteToUpdate) {
                    const newContent = `${noteToUpdate.content}\n${aiDecision.content}`;
                    updateNote(noteToUpdate.id, noteToUpdate.title, newContent);
                    Alert.alert("Note Updated!", `Added "${aiDecision.content}" to "${noteToUpdate.title}"`);
                }
            } else if (aiDecision.action === 'CREATE' && aiDecision.title) {
                addNote(aiDecision.title, aiDecision.content);
                Alert.alert("Note Created!", `New note saved with title: "${aiDecision.title}"`);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while processing your note.');
        } finally {
            setIsProcessing(false);
            if (uri) {
                try {
                    const file = new File(uri);
                    if (file.exists) await file.delete();
                } catch (deleteError) {
                    console.error('Failed to delete recording file:', deleteError);
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <NoteList notes={filteredNotes} />

            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.processingText}>AI is thinking...</Text>
                </View>
            )}

            {isRecording && !isProcessing && (
                <View style={styles.recordingIndicator}>
                    <FontAwesome5 name="microphone-alt" size={24} color="red" />
                    <Text style={styles.recordingText}>Recording...</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <FontAwesome5 name={isRecording ? "stop" : "microphone"} size={28} color="white" />
                )}
            </TouchableOpacity>

            <LanguageModal
                visible={isLanguageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
                onSelectLanguage={setSelectedLanguage}
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
        bottom: 50,
        right: 30,
        width: 90,
        height: 90,
        borderRadius: 45,
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
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    processingText: {
        marginTop: 15,
        color: '#fff',
        fontSize: 18,
    },
    searchContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
});