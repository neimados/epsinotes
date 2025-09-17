EpsiNotes 🎙️📝
EpsiNotes is a voice-first mobile note-taking application designed to capture, transcribe, and intelligently organize your thoughts with zero effort.

✨ Project Vision & Core Features
The Problem: In a world of constant information, great ideas are often lost because traditional note-taking is slow and requires manual organization.

Our Solution: EpsiNotes provides a seamless, voice-driven workflow. With a single tap, a user can record a thought, and our AI-powered backend transcribes it, suggests a title, and prepares it for instant recall, turning fleeting moments of inspiration into structured, searchable notes.

Key Features Implemented:
One-Tap Voice Recording: A simple and intuitive UI to capture audio notes instantly.

AI-Powered Transcription: Utilizes OpenAI's Whisper API for fast and highly accurate speech-to-text conversion.

Effortless Note Management: Save, edit, and delete notes with ease.

Persistent Local Storage: All notes are saved securely on the user's device for offline access.

Clean, Modern UI: A minimalist interface designed to keep the focus on your thoughts.

🛠️ Tech Stack & Architecture
This application was built with a modern, scalable, and maintainable technology stack, emphasizing best practices in mobile development.

Category	Technology / Library
Framework	React Native via Expo
Language	TypeScript
State Management	Zustand
API Services	OpenAI API (Whisper)
HTTP Client	Axios
Native APIs	expo-av for audio recording, expo-file-system for storage

🗺️ Future Roadmap
EpsiNotes is currently an MVP, but there is a clear vision for its future development:

[ ] Cloud Sync: Sync notes across multiple devices using a cloud backend like Firebase.

[ ] Advanced AI Features: Implement automatic categorization and entity highlighting (e.g., dates, names, locations) by sending transcribed text to a GPT model.

[ ] Web Application: Build a companion web app for desktop access to notes.

[ ] Improved UI/UX: Add animations, themes, and a more polished user interface.