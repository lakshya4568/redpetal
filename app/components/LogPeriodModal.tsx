import React, { useState } from "react";
import { 
  Modal, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Dimensions 
} from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeContext";
import { periodsAPI } from "../services/api";

interface LogPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string | null;
  onPeriodLogged?: () => void;
}

const { width } = Dimensions.get('window');

export default function LogPeriodModal({
  visible,
  onClose,
  selectedDate,
  onPeriodLogged,
}: LogPeriodModalProps) {
  const { theme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    flow: '',
    notes: '',
    symptoms: [] as string[],
    mood: '',
  });

  const flowLevels = [
    { value: 'light', label: 'Light', color: '#FFB6C1' },
    { value: 'medium', label: 'Medium', color: '#FF69B4' },
    { value: 'heavy', label: 'Heavy', color: '#DC143C' },
    { value: 'spotting', label: 'Spotting', color: '#FFC0CB' },
  ];

  const symptomOptions = [
    'Cramps', 'Bloating', 'Headache', 'Nausea', 'Fatigue', 
    'Back Pain', 'Breast Tenderness', 'Acne', 'Mood Swings', 'Diarrhea'
  ];

  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'energetic', emoji: '😄', label: 'Energetic' },
  ];

  const handleSave = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Log the period
      await periodsAPI.logPeriod({
        period_start_date: selectedDate,
        notes: formData.notes
      });

      // Log symptoms if any selected
      if (formData.symptoms.length > 0) {
        for (const symptom of formData.symptoms) {
          await periodsAPI.logSymptom({
            date: selectedDate,
            symptom_type: symptom.toLowerCase(),
            severity: 3, // Default severity
            notes: `Flow: ${formData.flow}`
          });
        }
      }

      // Log mood if selected
      if (formData.mood) {
        await periodsAPI.logMood({
          date: selectedDate,
          mood_type: formData.mood,
          intensity: 3, // Default intensity
          notes: formData.notes
        });
      }

      Alert.alert("Success", "Period data logged successfully!");
      
      // Reset form
      setFormData({
        flow: '',
        notes: '',
        symptoms: [],
        mood: '',
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
      ? formData.symptoms.filter(s => s !== symptom)
      : [...formData.symptoms, symptom];
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      margin: theme.spacing.lg,
      maxHeight: '85%',
      width: width * 0.92,
      ...theme.shadows.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headlineMedium,
      color: theme.colors.text,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
    dateText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    scrollContent: {
      maxHeight: 420,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      color: theme.colors.text,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
    flowGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    flowOption: {
      width: '48%',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.borderLight,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
    },
    flowOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
      ...theme.shadows.sm,
    },
    flowColorIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    flowLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: '600',
    },
    symptomsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    symptomChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      margin: theme.spacing.xs / 2,
      backgroundColor: theme.colors.surfaceVariant,
    },
    symptomChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    symptomText: {
      ...theme.typography.bodySmall,
      color: theme.colors.text,
      fontWeight: '500',
    },
    symptomTextSelected: {
      color: theme.colors.textOnPrimary,
      fontWeight: '600',
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    moodOption: {
      width: '30%',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.borderLight,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
    },
    moodOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
      ...theme.shadows.sm,
    },
    moodEmoji: {
      fontSize: 28,
      marginBottom: theme.spacing.sm,
    },
    moodLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.text,
      fontWeight: '500',
    },
    notesContainer: {
      position: 'relative',
    },
    notesInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 100,
      textAlignVertical: 'top',
      fontSize: 16,
      color: theme.colors.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.md,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      ...theme.typography.button,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
    saveButtonText: {
      color: theme.colors.textOnPrimary,
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
          <View style={styles.header}>
            <Ionicons 
              name="calendar" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.title}>Log Your Period</Text>
          </View>
          
          <Text style={styles.dateText}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            }) : ''}
          </Text>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Flow Level */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons 
                  name="water" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.sectionTitle}>Flow Level</Text>
              </View>
              <View style={styles.flowGrid}>
                {flowLevels.map(flow => (
                  <TouchableOpacity
                    key={flow.value}
                    style={[
                      styles.flowOption,
                      formData.flow === flow.value && styles.flowOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, flow: flow.value })}
                  >
                    <View 
                      style={[
                        styles.flowColorIndicator,
                        { backgroundColor: flow.color }
                      ]} 
                    />
                    <Text style={styles.flowLabel}>{flow.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons 
                  name="medical" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.sectionTitle}>Symptoms</Text>
              </View>
              <View style={styles.symptomsGrid}>
                {symptomOptions.map(symptom => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomChip,
                      formData.symptoms.includes(symptom) && styles.symptomChipSelected,
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text style={[
                      styles.symptomText,
                      formData.symptoms.includes(symptom) && styles.symptomTextSelected,
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons 
                  name="happy" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.sectionTitle}>Mood</Text>
              </View>
              <View style={styles.moodGrid}>
                {moodOptions.map(mood => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodOption,
                      formData.mood === mood.value && styles.moodOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, mood: mood.value })}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons 
                  name="document-text" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.sectionTitle}>Notes</Text>
              </View>
              <View style={styles.notesContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Add any additional notes about your day..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Ionicons 
                name="close" 
                size={20} 
                color={theme.colors.text} 
              />
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Ionicons 
                name="checkmark" 
                size={20} 
                color={theme.colors.textOnPrimary} 
              />
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
