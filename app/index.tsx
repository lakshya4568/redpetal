import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "./services/auth";

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}
