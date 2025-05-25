import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AlertProvider } from '@/lib/alert-context';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { redirectIfAuthenticated } = useAuth()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Redirect to main app if already authenticated
  useEffect(() => {
    if (loaded) {
      redirectIfAuthenticated()
    }
  }, [loaded])



  if (!loaded) {
    // Async font loading only occurs in development.
    return <>
      <ActivityIndicator size="large" color="#4CD964" />
    </>;
  }

  return (
    <AlertProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="onboarding/index" screenOptions={{ headerShown: false }} >
          {/* <Stack.Screen name="onboarding/" options={{ headerShown: false }} /> */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AlertProvider>
  );
}
