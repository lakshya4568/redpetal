import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

interface PostImage {
  id: string;
  uri: string;
}

interface CreatePostModalWithImagesProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string, images: PostImage[]) => void;
}

export default function CreatePostModalWithImages({
  visible,
  onClose,
  onSubmit,
}: CreatePostModalWithImagesProps) {
  const { theme } = useThemeContext();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<PostImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple React Native Animated API for submit button
  const submitButtonScale = React.useRef(new Animated.Value(1)).current;

  const resetForm = () => {
    setContent("");
    setImages([]);
    setIsSubmitting(false);
  };

  const requestPermissions = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to add images to your post.",
          [{ text: "OK", style: "default" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request permissions. Please try again.");
      return false;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: PostImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setImages((prev) => [...prev, newImage]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take photos.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newImage: PostImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setImages((prev) => [...prev, newImage]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const showImageOptions = () => {
    Alert.alert("Add Image", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert("Error", "Please add some content or images to your post.");
      return;
    }

    console.log("Creating post with content:", content, "and images:", images.length);
    setIsSubmitting(true);

    // Simple submit button animation
    Animated.sequence([
      Animated.timing(submitButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(submitButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onSubmit(content.trim(), images);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      overflow: "hidden",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.text + "20",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      fontFamily: theme.fonts.body.fontFamily,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    submitButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
      fontFamily: theme.fonts.body.fontFamily,
    },
    scrollView: {
      maxHeight: 400,
    },
    textInput: {
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: theme.fonts.body.fontFamily,
      minHeight: 120,
    },
    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    imagePreview: {
      width: (screenWidth * 0.9 - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
      height: 120,
      position: "relative",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      borderRadius: theme.borderRadius.md,
    },
    removeImageButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "#fff",
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "center",
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.text + "20",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.sm,
    },
    actionText: {
      marginLeft: theme.spacing.xs,
      fontSize: 14,
      color: theme.colors.primary,
      fontFamily: theme.fonts.body.fontFamily,
    },
    characterCount: {
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    characterCountText: {
      fontSize: 12,
      color: theme.colors.text + "60",
      fontFamily: theme.fonts.body.fontFamily,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Post</Text>
            <Animated.View style={{ transform: [{ scale: submitButtonScale }] }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  styles.submitButton,
                  { opacity: isSubmitting ? 0.6 : 1 },
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.text + "60"}
              multiline
              numberOfLines={6}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              maxLength={500}
            />

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <View style={styles.imageGrid}>
                {images.map((image, index) => (
                  <View key={image.id} style={styles.imagePreview}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(image.id)}
                      style={styles.removeImageButton}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color="#ff4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={showImageOptions}
                style={styles.actionButton}
              >
                <Ionicons
                  name="image"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.actionText}>Add Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Character Count */}
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {content.length}/500
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}