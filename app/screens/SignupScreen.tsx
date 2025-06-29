import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Animated, Platform } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useAuth } from '../services/auth';
import { theme } from '../theme';

const BACKGROUND_IMAGE = require('../../assets/images/floral-background.png');

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Using mock login for now
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>RedPetal</Text>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          <Button mode="contained" onPress={login} style={styles.button}>
            Signup
          </Button>
          <Button onPress={() => navigation.navigate('Login')} style={styles.button}>
            Go to Login
          </Button>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    padding: theme.spacing.medium,
  },
  formContainer: {
    width: Platform.OS === 'web' ? '50%' : '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 64,
    fontFamily: theme.fonts.cursive,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  input: {
    marginBottom: theme.spacing.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  button: {
    marginTop: theme.spacing.small,
    backgroundColor: theme.colors.primary,
  },
});
