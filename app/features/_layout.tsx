import { Stack } from "expo-router";

export default function FeaturesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="map" />
      <Stack.Screen name="doctors" />
    </Stack>
  );
}
