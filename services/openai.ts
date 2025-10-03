import axios from 'axios';
import Constants from 'expo-constants';
import { Note } from '../store/noteStore';

const getApiKey = (): string => {
  const apiKey = Constants.expoConfig?.extra?.openAiApiKey;
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('OpenAI API key is not set in app.config.js or app.json');
  }
  return apiKey;
};

const WHISPER_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';
const CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const AI_MODEL = 'gpt-4o-mini'; 

// --- TYPES ---
export interface AIResponse {
  action: 'UPDATE' | 'CREATE';
  noteId?: string;
  title?: string;
  content: string;
}

// --- API FUNCTIONS ---

/**
 * Transcribes an audio file using the OpenAI Whisper API.
 * @param audioUri The local file URI of the audio to transcribe.
 * @param language The ISO 639-1 code for the language of the audio.
 * @returns A promise that resolves to the transcribed text.
 */
export const transcribeAudio = async (audioUri: string, language: string): Promise<string> => {
  const apiKey = getApiKey();
  const formData = new FormData();

  formData.append('file', {
    uri: audioUri,
    name: `recording.m4a`,
    type: `audio/m4a`,
  } as any);
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  try {
    const response = await axios.post(WHISPER_ENDPOINT, formData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // The 'Content-Type' is set automatically by axios for FormData
      },
    });

    const transcribedText = response.data.text;
    console.log('Transcription successful:', transcribedText);
    return transcribedText;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Response:', error.response.data);
    }
    // Re-throw a more specific error
    throw new Error('Failed to transcribe audio. Please check your connection and API key.');
  }
};

/**
 * Generates the system prompt for the AI.
 */
const getSystemPrompt = (): string => {
  return `
    You are an expert note-processing AI. Your task is to analyze transcribed text and decide whether to CREATE a new note or UPDATE an existing one. You MUST respond with a single, valid JSON object and nothing else.

    Your decision process follows these rules in order:
    1.  **Entity Match Rule (Highest Priority):** If the text mentions a specific person, project, company, or case that matches an existing note title, your action MUST be "UPDATE". The title should be the clean entity name (e.g., "Peter", "BMX").
    2.  **Topic Match Rule:** If no entity matches, check if the text's content belongs to a general topic in the existing notes (e.g., adding "Milk" to a "Shopping List"). If it does, your action is "UPDATE".
    3.  **Creation Rule:** If neither of the above rules applies, your action is "CREATE". Generate a concise, new title for the note.

    Output Language Rule:
    - The "title" and "content" in your JSON output must be in the same language as the input text.

    JSON Output Schema:
    - {
    -   "action": "CREATE" | "UPDATE",
    -   "content": "The summarized, extracted content string.",
    -   "noteId"?: "The ID of the note to update (only for 'UPDATE' action).",
    -   "title"?: "A new, concise title for the note (only for 'CREATE' action)."
    - }

    If the input is unintelligible, return:
    {"action":"CREATE","title":"Uncategorized","content":""}
  `;
};

/**
 * Uses an AI model to decide whether to create a new note or update an existing one.
 * @param transcribedText The text from the audio transcription.
 * @param existingNotes An array of existing notes to provide context.
 * @returns A promise that resolves to an AIResponse object.
 */
export const categorizeOrTitleNote = async (
  transcribedText: string,
  existingNotes: Note[]
): Promise<AIResponse> => {
  const apiKey = getApiKey();
  const noteTitles = existingNotes.map(({ id, title }) => ({ id, title }));

  const userPrompt = `
    <transcribed_text>
    ${transcribedText}
    </transcribed_text>

    <existing_notes>
    ${JSON.stringify(noteTitles)}
    </existing_notes>
  `;
  
  const fallbackResponse: AIResponse = {
    action: 'CREATE',
    title: transcribedText.substring(0, 30) || 'New Note', // Ensure title is not empty
    content: transcribedText,
  };

  try {
    const response = await axios.post(
      CHAT_ENDPOINT,
      {
        model: AI_MODEL,
        response_format: { type: "json_object" }, // Use JSON mode for better reliability
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponseContent = response.data.choices[0].message.content;
    console.log('AI Raw Response:', aiResponseContent);

    // ✅ **Robust JSON Parsing**
    // The AI can sometimes return invalid JSON. This prevents a crash.
    try {
      return JSON.parse(aiResponseContent) as AIResponse;
    } catch (parseError) {
      console.error('Failed to parse AI JSON response:', parseError);
      return fallbackResponse; // Return a safe default if parsing fails
    }

  } catch (error) {
    console.error('Error with AI categorization:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Response:', error.response.data);
    }
    return fallbackResponse;
  }
};