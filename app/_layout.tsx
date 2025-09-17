import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'EpsiNotes 📝',
          }}
        />
        <Stack.Screen
          name="note/[id]"
          options={{
            title: 'Edit Note',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}