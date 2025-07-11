import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
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

  // Animation values
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
    // Trigger like animation
    likeScale.value = withSequence(
      withSpring(0.8, { duration: 100 }),
      withSpring(1.2, { duration: 200 }),
      withSpring(1, { duration: 200 })
    );

    if (!isLiked) {
      // Show heart animation for new likes
      heartOpacity.value = withTiming(1, { duration: 200 });
      heartScale.value = withSequence(
        withSpring(1.5, { duration: 300 }),
        withTiming(0, { duration: 200 }, () => {
          runOnJS(() => {
            heartOpacity.value = 0;
            heartScale.value = 0;
          })();
        })
      );

      // Add rotation for new likes
      likeRotation.value = withSequence(
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }

    runOnJS(onLike)(id);
  };

  const handleLongPressLike = () => {
    setShowReactions(!showReactions);

    if (!showReactions) {
      reactionPanelScale.value = withSpring(1, { duration: 300 });
      reactionPanelOpacity.value = withTiming(1, { duration: 200 });
    } else {
      reactionPanelScale.value = withTiming(0, { duration: 200 });
      reactionPanelOpacity.value = withTiming(0, { duration: 200 });
    }
  };

  const handleReaction = (reactionType: string) => {
    // Animate reaction selection
    likeScale.value = withSequence(
      withSpring(0.9, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );

    // Hide reaction panel
    reactionPanelScale.value = withTiming(0, { duration: 200 });
    reactionPanelOpacity.value = withTiming(0, { duration: 200 });

    runOnJS(() => {
      setShowReactions(false);
      onReaction(id, reactionType);
    })();
  };

  const handleCardPress = () => {
    cardScale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const renderImage = ({ item, index }: { item: PostImage; index: number }) => (
    <Image
      source={{ uri: item.uri }}
      style={[styles(theme).postImage, { width: screenWidth - 40 }]}
      resizeMode="cover"
    />
  );

  return (
    <Animated.View style={[styles(theme).card, cardStyle]}>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.95}>
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
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / (screenWidth - 40)
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
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      padding: theme.spacing.lg,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
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
      borderRadius: 20,
      marginRight: theme.spacing.md,
    },
    defaultProfileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
      fontFamily: theme.fonts.body.fontFamily,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.text + "80",
      fontFamily: theme.fonts.body.fontFamily,
    },
    content: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
      fontFamily: theme.fonts.body.fontFamily,
    },
    imageContainer: {
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      overflow: "hidden",
    },
    postImage: {
      height: 200,
      borderRadius: theme.borderRadius.md,
    },
    imageIndicators: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    indicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.text + "40",
      marginHorizontal: 2,
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
      marginRight: 4,
    },
    reactionCount: {
      fontSize: 12,
      color: theme.colors.text + "80",
      marginLeft: theme.spacing.xs,
      fontFamily: theme.fonts.body.fontFamily,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.text + "20",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.sm,
      position: "relative",
    },
    actionText: {
      marginLeft: theme.spacing.xs,
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: theme.fonts.body.fontFamily,
    },
    floatingHeart: {
      position: "absolute",
      top: -30,
      left: 15,
      zIndex: 1000,
    },
    floatingHeartText: {
      fontSize: 30,
    },
    reactionPanel: {
      position: "absolute",
      bottom: 80,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.text + "10",
    },
    reactionButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    reactionButtonText: {
      fontSize: 28,
    },
  });
