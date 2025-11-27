import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { periodsAPI } from "../../services/api";
import { useThemeContext } from "./ThemeContext";

interface LogPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string | null;
  onPeriodLogged?: () => void;
}

const { width } = Dimensions.get("window");

export default function LogPeriodModal({
  visible,
  onClose,
  selectedDate,
  onPeriodLogged,
}: LogPeriodModalProps) {
  const { theme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    flow: "",
    notes: "",
    symptoms: [] as string[],
    mood: "",
  });

  const flowLevels = [
    { value: "light", label: "Light", color: "#FFB6C1" },
    { value: "medium", label: "Medium", color: "#FF69B4" },
    { value: "heavy", label: "Heavy", color: "#DC143C" },
    { value: "spotting", label: "Spotting", color: "#FFC0CB" },
  ];

  const symptomOptions = [
    "Cramps",
    "Bloating",
    "Headache",
    "Nausea",
    "Fatigue",
    "Back Pain",
    "Breast Tenderness",
    "Acne",
    "Mood Swings",
    "Diarrhea",
  ];

  const moodOptions = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "sad", emoji: "😢", label: "Sad" },
    { value: "angry", emoji: "😠", label: "Angry" },
    { value: "anxious", emoji: "😰", label: "Anxious" },
    { value: "tired", emoji: "😴", label: "Tired" },
    { value: "energetic", emoji: "😄", label: "Energetic" },
  ];

  const handleSave = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Log the period
      await periodsAPI.logPeriod({
        period_start_date: selectedDate,
        notes: formData.notes,
      });

      // Log symptoms if any selected
      if (formData.symptoms.length > 0) {
        for (const symptom of formData.symptoms) {
          await periodsAPI.logSymptom({
            date: selectedDate,
            symptom_type: symptom.toLowerCase(),
            severity: 3, // Default severity
            notes: `Flow: ${formData.flow}`,
          });
        }
      }

      // Log mood if selected
      if (formData.mood) {
        await periodsAPI.logMood({
          date: selectedDate,
          mood_type: formData.mood,
          intensity: 3, // Default intensity
          notes: formData.notes,
        });
      }

      Alert.alert("Success", "Period data logged successfully!");

      // Reset form
      setFormData({
        flow: "",
        notes: "",
        symptoms: [],
        mood: "",
      });

      onPeriodLogged?.();
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to log period data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = formData.symptoms.includes(symptom)
      ? formData.symptoms.filter((s) => s !== symptom)
      : [...formData.symptoms, symptom];
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      margin: theme.spacing.lg,
      maxHeight: "80%",
      width: width * 0.9,
    },
    title: {
      ...theme.typography.headlineMedium,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    dateText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    scrollContent: {
      maxHeight: 400,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    flowGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    flowOption: {
      width: "48%",
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.borderLight,
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    flowOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
    },
    flowLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: "600",
    },
    symptomsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    symptomChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      margin: theme.spacing.xs / 2,
    },
    symptomChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    symptomText: {
      ...theme.typography.bodySmall,
      color: theme.colors.text,
    },
    symptomTextSelected: {
      color: theme.colors.textOnPrimary,
    },
    moodGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    moodOption: {
      width: "30%",
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.borderLight,
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    moodOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
    },
    moodEmoji: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    moodLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.text,
    },
    notesInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 80,
      textAlignVertical: "top",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.xl,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
      marginHorizontal: theme.spacing.sm,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
      fontWeight: "600",
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Log Your Period</Text>
          <Text style={styles.dateText}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString() : ""}
          </Text>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Flow Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Flow Level</Text>
              <View style={styles.flowGrid}>
                {flowLevels.map((flow) => (
                  <TouchableOpacity
                    key={flow.value}
                    style={[
                      styles.flowOption,
                      formData.flow === flow.value && styles.flowOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, flow: flow.value })
                    }
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: flow.color,
                        borderRadius: 10,
                        marginBottom: theme.spacing.xs,
                      }}
                    />
                    <Text style={styles.flowLabel}>{flow.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              <View style={styles.symptomsGrid}>
                {symptomOptions.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomChip,
                      formData.symptoms.includes(symptom) &&
                        styles.symptomChipSelected,
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text
                      style={[
                        styles.symptomText,
                        formData.symptoms.includes(symptom) &&
                          styles.symptomTextSelected,
                      ]}
                    >
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood</Text>
              <View style={styles.moodGrid}>
                {moodOptions.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodOption,
                      formData.mood === mood.value && styles.moodOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, mood: mood.value })
                    }
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                placeholder="Add any additional notes..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
