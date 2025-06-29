import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogPeriodModal({ visible, onClose, selectedDate }) {
  const [flow, setFlow] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [mood, setMood] = useState('');

  const handleSave = async () => {
    try {
      const data = { flow, symptoms, mood };
      await AsyncStorage.setItem(selectedDate, JSON.stringify(data));
      onClose();
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Log Period Data</Text>
        <TextInput label="Flow Intensity" value={flow} onChangeText={setFlow} style={styles.input} />
        <TextInput label="Symptoms" value={symptoms} onChangeText={setSymptoms} style={styles.input} />
        <TextInput label="Mood" value={mood} onChangeText={setMood} style={styles.input} />
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
