import { Stack } from "expo-router";

export default function FeaturesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="log" />
      <Stack.Screen name="report" />
      <Stack.Screen name="map/index" />
      <Stack.Screen name="doctors/index" />
    </Stack>
  );
}
