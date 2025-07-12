import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
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

interface Reaction {
  id: string;
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  emoji: string;
  count: number;
}

interface AnimatedPostCardProps {
  id: string;
  username: string;
  profileImage?: string;
  content: string;
  images?: PostImage[];
  timestamp: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  reactions: Reaction[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onReaction: (id: string, type: string) => void;
}

const reactionTypes = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "laugh", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
  { type: "angry", emoji: "😠" },
];

export default function AnimatedPostCard({
  id,
  username,
  profileImage,
  content,
  images = [],
  timestamp,
  likeCount,
  commentCount,
  isLiked,
  reactions,
  onLike,
  onComment,
  onShare,
  onReaction,
}: AnimatedPostCardProps) {
  const { theme } = useThemeContext();
  const [showReactions, setShowReactions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate proper image width based on card margins and padding
  const cardMargin =
    Platform.OS === "android" ? theme.spacing.md : theme.spacing.lg;
  const cardPadding = theme.spacing.lg;
  const imageWidth = screenWidth - cardMargin * 2 - cardPadding * 2;

  // Animation values with reduced complexity for better Android performance
  const likeScale = useSharedValue(1);
  const likeRotation = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const reactionPanelScale = useSharedValue(0);
  const reactionPanelOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);

  // Animated styles
  const likeButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: likeScale.value },
      { rotate: `${likeRotation.value}deg` },
    ],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  const reactionPanelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reactionPanelScale.value }],
    opacity: reactionPanelOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleLike = () => {
    try {
      // Trigger like animation with error handling
      likeScale.value = withSequence(
        withSpring(0.9, { damping: 10, stiffness: 300 }),
        withSpring(1.1, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );

      if (!isLiked) {
        // Show heart animation for new likes
        heartOpacity.value = withTiming(1, { duration: 200 });
        heartScale.value = withSequence(
          withSpring(1.3, { damping: 10, stiffness: 300 }),
          withTiming(0, { duration: 150 }, () => {
            runOnJS(() => {
              heartOpacity.value = 0;
              heartScale.value = 0;
            })();
          })
        );

        // Add subtle rotation for new likes
        likeRotation.value = withSequence(
          withTiming(8, { duration: 80 }),
          withTiming(-8, { duration: 80 }),
          withTiming(0, { duration: 80 })
        );
      }

      runOnJS(onLike)(id);
    } catch (error) {
      console.error("Like animation error:", error);
      // Fallback to just calling the onLike function
      runOnJS(onLike)(id);
    }
  };

  const handleLongPressLike = () => {
    try {
      setShowReactions(!showReactions);

      if (!showReactions) {
        reactionPanelScale.value = withSpring(1, { duration: 250 });
        reactionPanelOpacity.value = withTiming(1, { duration: 150 });
      } else {
        reactionPanelScale.value = withTiming(0, { duration: 150 });
        reactionPanelOpacity.value = withTiming(0, { duration: 150 });
      }
    } catch (error) {
      console.error("Reaction panel error:", error);
      setShowReactions(!showReactions);
    }
  };

  const handleReaction = (reactionType: string) => {
    try {
      // Animate reaction selection
      likeScale.value = withSequence(
        withSpring(0.95, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );

      // Hide reaction panel
      reactionPanelScale.value = withTiming(0, { duration: 150 });
      reactionPanelOpacity.value = withTiming(0, { duration: 150 });

      runOnJS(() => {
        setShowReactions(false);
        onReaction(id, reactionType);
      })();
    } catch (error) {
      console.error("Reaction handler error:", error);
      setShowReactions(false);
      onReaction(id, reactionType);
    }
  };

  const handleCardPress = () => {
    try {
      cardScale.value = withSequence(
        withTiming(0.98, { duration: 80 }),
        withTiming(1, { duration: 80 })
      );
    } catch (error) {
      console.error("Card press animation error:", error);
    }
  };

  const renderImage = ({ item, index }: { item: PostImage; index: number }) => (
    <Image
      source={{ uri: item.uri }}
      style={[styles(theme).postImage, { width: imageWidth }]}
      resizeMode="cover"
    />
  );

  return (
    <Animated.View style={[styles(theme).card, cardStyle]}>
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.95}
        delayPressIn={0}
        delayPressOut={0}
      >
        {/* Header */}
        <View style={styles(theme).header}>
          <View style={styles(theme).userInfo}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles(theme).profileImage}
              />
            ) : (
              <View style={styles(theme).defaultProfileImage}>
                <Ionicons name="person" size={20} color={theme.colors.text} />
              </View>
            )}
            <View>
              <Text style={styles(theme).username}>{username}</Text>
              <Text style={styles(theme).timestamp}>{timestamp}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Text style={styles(theme).content}>{content}</Text>

        {/* Images */}
        {images.length > 0 && (
          <View style={styles(theme).imageContainer}>
            <FlatList
              data={images}
              renderItem={renderImage}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={Platform.OS === "android"}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              getItemLayout={(data, index) => ({
                length: imageWidth,
                offset: imageWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / imageWidth
                );
                setCurrentImageIndex(index);
              }}
            />
            {images.length > 1 && (
              <View style={styles(theme).imageIndicators}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles(theme).indicator,
                      currentImageIndex === index &&
                        styles(theme).activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Reactions Display */}
        {reactions.length > 0 && (
          <View style={styles(theme).reactionsDisplay}>
            {reactions.slice(0, 3).map((reaction) => (
              <Text key={reaction.id} style={styles(theme).reactionEmoji}>
                {reaction.emoji}
              </Text>
            ))}
            <Text style={styles(theme).reactionCount}>
              {reactions.reduce((sum, r) => sum + r.count, 0)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles(theme).actions}>
          <TouchableOpacity
            onPress={handleLike}
            onLongPress={handleLongPressLike}
            style={styles(theme).actionButton}
          >
            <Animated.View style={likeButtonStyle}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ff6b6b" : theme.colors.text}
              />
            </Animated.View>
            <Text style={styles(theme).actionText}>{likeCount}</Text>

            {/* Floating heart animation */}
            <Animated.View style={[styles(theme).floatingHeart, heartStyle]}>
              <Text style={styles(theme).floatingHeartText}>❤️</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onComment(id)}
            style={styles(theme).actionButton}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={theme.colors.text}
            />
            <Text style={styles(theme).actionText}>{commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onShare(id)}
            style={styles(theme).actionButton}
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.text}
            />
            <Text style={styles(theme).actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Reaction Panel */}
        {showReactions && (
          <Animated.View
            style={[styles(theme).reactionPanel, reactionPanelStyle]}
          >
            {reactionTypes.map((reaction) => (
              <TouchableOpacity
                key={reaction.type}
                onPress={() => handleReaction(reaction.type)}
                style={styles(theme).reactionButton}
              >
                <Text style={styles(theme).reactionButtonText}>
                  {reaction.emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      marginVertical: theme.spacing.sm,
      marginHorizontal:
        Platform.OS === "android" ? theme.spacing.md : theme.spacing.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
      elevation: 4, // Added elevation for Android shadow
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.md,
    },
    defaultProfileImage: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    username: {
      ...theme.typography.titleMedium,
      color: theme.colors.text,
      fontWeight: "600",
    },
    timestamp: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    content: {
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    imageContainer: {
      borderRadius: theme.borderRadius.lg,
      overflow: "hidden",
      marginBottom: theme.spacing.md,
      height: 250, // Fixed height for image container
    },
    postImage: {
      height: "100%",
      borderRadius: theme.borderRadius.lg,
    },
    imageIndicators: {
      position: "absolute",
      bottom: 10,
      flexDirection: "row",
      justifyContent: "center",
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      marginHorizontal: 4,
    },
    activeIndicator: {
      backgroundColor: theme.colors.primary,
    },
    reactionsDisplay: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    reactionEmoji: {
      fontSize: 16,
      marginRight: 2,
    },
    reactionCount: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.sm,
    },
    actionText: {
      ...theme.typography.button,
      marginLeft: theme.spacing.sm,
      color: theme.colors.text,
    },
    likeText: {
      ...theme.typography.button,
      marginLeft: theme.spacing.sm,
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    heartContainer: {
      position: "absolute",
      top: "40%",
      left: "45%",
      zIndex: 10,
    },
    floatingHeart: {
      position: "absolute",
      top: "40%",
      left: "45%",
      zIndex: 10,
    },
    floatingHeartText: {
      fontSize: 50,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    reactionPanel: {
      position: "absolute",
      bottom: 50,
      left: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xxl,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      ...theme.shadows.lg,
      zIndex: 20,
      elevation: 10, // Added elevation for Android shadow
    },
    reaction: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    reactionButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    reactionButtonText: {
      fontSize: 28,
    },
  });
