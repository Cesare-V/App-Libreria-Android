import { Redirect, SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
 const router = useRouter();
  const segments = useSegments();
  const {checkAuth, user, token, isAuthReady} = useAuthStore();

 const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  })

  useEffect(() => {
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Gestisce la navigazione in base allo stato di autenticazione
  useEffect(() => {
    if (!isAuthReady) return;
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
        // Se non autenticato e non sei già in auth, vai a /auth
        router.replace("/(auth)"); 
    } else if (isSignedIn && inAuthScreen) {
        // Se autenticato e sei in auth, vai alle tabs
        router.replace("/(tabs)");
    }

  }, [user, token, segments, isAuthReady]);

  if (!isAuthReady) {
        return null; // Blocca il rendering dello Stack/UI
    }

  return (
    <SafeAreaProvider>
      <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
      </SafeScreen> 
      <StatusBar  style="dark"/>
    </SafeAreaProvider>
  );
}
