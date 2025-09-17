import axios from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

// Access the API key from our app config
const apiKey = "API KEY";
const apiEndpoint = 'https://api.openai.com/v1/audio/transcriptions';

/**
 * Transcribes an audio file using the OpenAI Whisper API.
 * @param audioUri The local file URI of the audio to transcribe.
 * @returns A promise that resolves to the transcribed text.
 */
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is not set in app config.');
  }

  const formData = new FormData();

  // The file needs to be added with specific properties for the API to process it.
  // We use a cast to `any` because the standard FormData type definition in browsers/node
  // doesn't align perfectly with what React Native expects for file uploads.
  formData.append('file', {
    uri: audioUri,
    name: `recording.m4a`, // The API requires a file name and extension
    type: `audio/m4a`,     // And a mime type
  } as any);

  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post(apiEndpoint, formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // The 'Content-Type' is crucial and is set to 'multipart/form-data'
        // by axios when you use a FormData object.
      },
    });

    const transcribedText = response.data.text;
    console.log('Transcription successful:', transcribedText);
    return transcribedText;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    // It's helpful to log the full error response if available
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Response:', error.response.data);
    }
    throw new Error('Failed to transcribe audio.');
  }
};