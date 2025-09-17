import axios from 'axios';
import Constants from 'expo-constants';
import { Note } from '../store/noteStore';

const apiKey = "API KEY";
const whisperEndpoint = 'https://api.openai.com/v1/audio/transcriptions';
const chatEndpoint = 'https://api.openai.com/v1/chat/completions'; 

/**
 * Transcribes an audio file using the OpenAI Whisper API.
 * @param audioUri The local file URI of the audio to transcribe.
 * @param language The ISO 639-1 code for the language of the audio.
 * @returns A promise that resolves to the transcribed text.
 */
export const transcribeAudio = async (audioUri: string, language: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is not set in app config.');
  }

  const formData = new FormData();

  formData.append('file', {
    uri: audioUri,
    name: `recording.m4a`,
    type: `audio/m4a`,
  } as any);

  formData.append('model', 'whisper-1');
  formData.append('language', language); 

  try {
    const response = await axios.post(whisperEndpoint, formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const transcribedText = response.data.text;
    console.log('Transcription successful:', transcribedText);
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Response:', error.response.data);
    }
    throw new Error('Failed to transcribe audio.');
  }
};

export interface AIResponse {
    action: 'UPDATE' | 'CREATE';
    noteId?: string; 
    title?: string;
    content: string;
}

export const categorizeOrTitleNote = async (
    transcribedText: string,
    existingNotes: Note[]
): Promise<AIResponse> => {
    if (!apiKey) {
        throw new Error('OpenAI API key is not set in app config.');
    }

    const noteTitles = existingNotes.map(({ id, title }) => ({ id, title }));

    const prompt = `
        You are a precise note-taking assistant. Your only job is to return a single JSON object representing how to store the new information.

        Input:
        New Transcribed Text: "${transcribedText}"
        Existing Notes: ${JSON.stringify(noteTitles)}

        Instructions:
        1. **Extract Content**:
          - Rewrite the text as a short, structured item.
          - Example: "get some bread from the store" → "Bread"
          - Example: "the door code is 4821" → "Door code: 4821"
          - Example: "remind me to call Mom tomorrow" → "Call Mom"

        2. **Decide Action**:
          - **UPDATE**: Only if the new content clearly belongs in an existing note category.
            - Example: "Milk" added to "Shopping List".
          - **CREATE**: Default action. If there is any doubt, create a new note.
            - Use a short, reusable title like "Shopping List", "Access Codes", "Reminders", or "Ideas".
            - Do not invent long or overly specific titles.

        3. **Output Rules**:
          - Always respond with one valid JSON object.
          - Always return the "content" field in the same language as the user’s input text.
          - JSON fields:
            - "action": either "CREATE" or "UPDATE"
            - "content": the extracted content string
            - If action=UPDATE → include "noteId"
            - If action=CREATE → include "title"
          - No text outside the JSON.
          - If nothing useful can be extracted, return:
            {"action":"CREATE","title":"Uncategorized","content":""}

        Examples:
        Input: "buy more milk" | Existing Notes: [{"id":"123","title":"Shopping List"}]
        Output: {"action":"UPDATE","noteId":"123","content":"Milk"}

        Input: "door code is 4821" | Existing Notes: [{"id":"456","title":"Travel Plans"}]
        Output: {"action":"CREATE","title":"Access Codes","content":"Door code: 4821"}

        Input: "remind me to call Mom" | Existing Notes: []
        Output: {"action":"CREATE","title":"Reminders","content":"Call Mom"}

        Input: "For Peter, we can buy him a new laptop" | Existing Notes: 
        Output: {"action":"CREATE","title":"Peter","content":"Buy laptop"}

        Input: "Let's grab Peter a new mouse too" | Existing Notes: [{"id":"789","title":"Peter"}]
        Output: {"action":"UPDATE","noteId":"789","content":"Buy mouse"}

        Input: "On the BMX case we need to recalculate the turnover" | Existing Notes: []
        Output: {"action":"CREATE","title":"BMX","content":"Recalculate turnover"}

        Input: "For the customer BMX it is better to use red as main color" | Existing Notes: [{"id":"999","title":"BMX"}]
        Output: {"action":"UPDATE","noteId":"999","content":"Use red as main color"}
    `;

    try {
        const response = await axios.post(
            chatEndpoint,
            {
                model: 'gpt-5-nano',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const aiResponseContent = response.data.choices[0].message.content;
        console.log("AI Raw Response:", aiResponseContent);
        return JSON.parse(aiResponseContent) as AIResponse;

    } catch (error) {
        console.error('Error with AI categorization:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.error('API Response:', error.response.data);
        }
        return {
            action: 'CREATE',
            title: transcribedText.substring(0, 30),
            content: transcribedText,
        };
    }
};