import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    // SafeAreaProvider is a good practice for handling notches and device safe areas
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="index" // This corresponds to index.tsx
          options={{
            title: 'EchoNote 📝', // Sets the header title
            headerLargeTitle: true,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}