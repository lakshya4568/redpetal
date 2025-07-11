import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
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
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

  // Animation values
  const modalScale = useSharedValue(0);
  const submitButtonScale = useSharedValue(1);
  const keyboard = useAnimatedKeyboard();

  // Animated styles
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value / 2 }],
  }));

  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitButtonScale.value }],
  }));

  React.useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { duration: 300 });
    } else {
      modalScale.value = withTiming(0, { duration: 200 });
      // Reset form when modal closes
      setContent("");
      setImages([]);
      setIsSubmitting(false);
    }
  }, [visible, modalScale]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to add images to your post."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: PostImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      };
      setImages((prev) => [...prev, newImage]);
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

    setIsSubmitting(true);

    // Animate submit button
    submitButtonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    try {
      await onSubmit(content.trim(), images);
      onClose();
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    modalScale.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles(theme).overlay}>
        <Animated.View style={[styles(theme).container, containerStyle]}>
          <Animated.View style={[styles(theme).modal, modalStyle]}>
            {/* Header */}
            <View style={styles(theme).header}>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles(theme).title}>Create Post</Text>
              <Animated.View style={submitButtonStyle}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={[
                    styles(theme).submitButton,
                    { opacity: isSubmitting ? 0.6 : 1 },
                  ]}
                >
                  <Text style={styles(theme).submitButtonText}>
                    {isSubmitting ? "Posting..." : "Post"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <ScrollView
              style={styles(theme).scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Text Input */}
              <TextInput
                style={styles(theme).textInput}
                placeholder="What's on your mind?"
                placeholderTextColor={theme.colors.text + "60"}
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <View style={styles(theme).imageGrid}>
                  {images.map((image, index) => (
                    <View key={image.id} style={styles(theme).imagePreview}>
                      <Image
                        source={{ uri: image.uri }}
                        style={styles(theme).previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(image.id)}
                        style={styles(theme).removeImageButton}
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
              <View style={styles(theme).actions}>
                <TouchableOpacity
                  onPress={showImageOptions}
                  style={styles(theme).actionButton}
                >
                  <Ionicons
                    name="image"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles(theme).actionText}>Add Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles(theme).actionButton}>
                  <Ionicons
                    name="location"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles(theme).actionText}>Add Location</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles(theme).actionButton}>
                  <Ionicons
                    name="happy"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles(theme).actionText}>Feeling</Text>
                </TouchableOpacity>
              </View>

              {/* Character Count */}
              <View style={styles(theme).characterCount}>
                <Text style={styles(theme).characterCountText}>
                  {content.length}/500
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "90%",
      maxHeight: "80%",
    },
    modal: {
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
      justifyContent: "space-around",
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
