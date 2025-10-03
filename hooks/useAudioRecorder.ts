import { useState, useEffect } from 'react';
import {
  // Renamed the imported hook to avoid a name collision
  useAudioRecorder as useExpoAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

// This interface remains the same
interface StopRecordingResult {
  success: boolean;
  uri: string | null;
  duration: number; // Duration in milliseconds
}

// Your exported custom hook keeps its original name
export const useAudioRecorder = () => {
  // --- New Expo Audio Hooks ---
  // Use the new, aliased name for the hook from the library
  const audioRecorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // --- Local State ---
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // --- Cleanup Logic ---
  useEffect(() => {
    (async () => {
      const perms = await AudioModule.requestRecordingPermissionsAsync();
      if (perms.granted) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      const perms = await AudioModule.getRecordingPermissionsAsync();
      if (!perms.granted) {
        console.error("Microphone permission not granted");
        return;
      }
      
      console.log('Starting recording..');
      setRecordingUri(null);
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (): Promise<StopRecordingResult> => {
    if (!recorderState.isRecording) {
      return { success: false, uri: null, duration: 0 };
    }

    console.log('Stopping recording..');
    
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      const duration = recorderState.durationMillis;
      
      if (duration < 1000 || !uri) {
        console.log('Recording too short or failed, discarding.');
        setRecordingUri(null);
        return { success: false, uri: null, duration }; 
      }
      
      console.log('Recording saved at:', uri);
      setRecordingUri(uri);
      
      return { success: true, uri: uri, duration };

    } catch (err) {
      console.error('Failed to stop recording', err);
      return { success: false, uri: null, duration: 0 };
    }
  };

  return {
    isRecording: recorderState.isRecording,
    recordingUri,
    startRecording,
    stopRecording,
  };
};