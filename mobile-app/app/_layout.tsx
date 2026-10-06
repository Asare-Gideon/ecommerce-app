import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { AlertProvider } from '@/lib/alert-context';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  usePushNotifications();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return <>
      <ActivityIndicator size="large" color="#4CD964" />
    </>;
  }

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
            <Stack screenOptions={{ headerShown: false }} >
              <Stack.Screen name="index" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SafeAreaView>
          <StatusBar style="auto" backgroundColor="#fff" />
        </ThemeProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
