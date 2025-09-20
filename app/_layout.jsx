import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/SignIn" />
      <Stack.Screen name="auth/SignUp" />
      <Stack.Screen name="home/Profile" />
 
    </Stack>
  );
}
