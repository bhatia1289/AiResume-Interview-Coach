/**
 * Root Layout
 * Main app layout with AuthContext provider
 */

import { Stack } from 'expo-router';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366F1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen
            name="login"
            options={{
              title: 'Login',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              title: 'Register',
              headerShown: false,
            }}
          />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="problems"
            options={{
              title: 'Problems',
            }}
          />
          <Stack.Screen
            name="problem-detail"
            options={{
              title: 'Problem',
            }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
