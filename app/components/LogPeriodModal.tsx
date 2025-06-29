import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { theme } from "../theme";

interface LogPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string | null;
}

export default function LogPeriodModal({
  visible,
  onClose,
  selectedDate,
}: LogPeriodModalProps) {
  const [flow, setFlow] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [mood, setMood] = useState("");

  const handleSave = async () => {
    if (!selectedDate) return;

    try {
      const data = { flow, symptoms, mood };
      await AsyncStorage.setItem(selectedDate, JSON.stringify(data));
      onClose();
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Log Your Day</Text>
        <TextInput
          label="Flow Intensity"
          value={flow}
          onChangeText={setFlow}
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />
        <TextInput
          label="Symptoms"
          value={symptoms}
          onChangeText={setSymptoms}
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />
        <TextInput
          label="Mood"
          value={mood}
          onChangeText={setMood}
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save
        </Button>
        <Button onPress={onClose} style={styles.button}>
          Cancel
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.headlineLarge,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.xxl,
  },
  input: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
});
