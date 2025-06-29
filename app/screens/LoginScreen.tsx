import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Animated } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useAuth } from '../services/auth';

// Please download the Great Vibes font from Google Fonts and place it in assets/fonts
// You can find free floral background images on sites like Unsplash or Pexels.
const BACKGROUND_IMAGE = require('../../assets/images/floral-background.png');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
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
        <Animated.View style={{ opacity: fadeAnim }}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            theme={{ colors: { primary: '#ff8fab' } }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: '#ff8fab' } }}
          />
          <Button mode="contained" onPress={login} style={styles.button}>
            Login
          </Button>
          <Button onPress={() => navigation.navigate('Signup')} style={styles.button}>
            Go to Signup
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
    padding: 16,
  },
  title: {
    fontSize: 64,
    fontFamily: 'GreatVibes-Regular',
    color: '#ff8fab',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#ff8fab',
  },
});
