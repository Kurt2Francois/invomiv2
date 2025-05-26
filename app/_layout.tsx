import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { TransactionProvider } from "../context/TransactionContext"

export default function RootLayout() {
  return (
    <TransactionProvider>
      <>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </>
    </TransactionProvider>
  )
}
