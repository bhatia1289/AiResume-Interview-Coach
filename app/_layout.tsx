/**
 * Root Layout
 * Main app layout with AuthContext provider
 */

import { Stack } from 'expo-router';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#6366F1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="login"
          options={{ title: 'Login', headerShown: false }}
        />
        <Stack.Screen
          name="register"
          options={{ title: 'Register', headerShown: false }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{ title: 'Forgot Password', headerShown: false }}
        />
        <Stack.Screen
          name="reset-password"
          options={{ title: 'Reset Password', headerShown: false }}
        />
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6366F1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="problems"
        options={{ title: 'Problems' }}
      />
      <Stack.Screen
        name="problem-detail"
        options={{ title: 'Problem' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
