// /hooks/useAudioRecorder.ts
import { useState, useRef } from 'react';
import { Audio } from 'expo-av';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  
  // These will be managed internally by the hook now
  const recordingObject = useRef<Audio.Recording | null>(null);
  const startTime = useRef<number>(0);

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error("Microphone permission not granted");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingObject.current = recording;
      startTime.current = Date.now(); // Set start time
      setIsRecording(true);

    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async (): Promise<{ success: boolean; uri: string | null }> => {
    if (!recordingObject.current) {
      setIsRecording(false);
      return { success: false, uri: null };
    }

    console.log('Stopping recording..');
    const duration = Date.now() - startTime.current;
    
    try {
      await recordingObject.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      if (duration < 1000) {
        console.log('Recording too short, discarding.');
        // Clean up without setting the URI
        recordingObject.current = null;
        setIsRecording(false);
        setRecordingUri(null);
        return { success: false, uri: null }; // Indicate failure
      }
      
      const uri = recordingObject.current.getURI();
      console.log('Recording saved at:', uri);
      
      // Clean up and set the URI to trigger processing
      recordingObject.current = null;
      setIsRecording(false);
      setRecordingUri(uri);
      return { success: true, uri: uri }; // Indicate success

    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsRecording(false);
      return { success: false, uri: null };
    }
  };

  return {
    isRecording,
    recordingUri,
    startRecording,
    stopRecording,
  };
};