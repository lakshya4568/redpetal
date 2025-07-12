import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  // React Native Animated API (stable for Android Expo Go)
  const likeScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const reactionPanelScale = useRef(new Animated.Value(0)).current;
  const reactionPanelOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    console.log("Like button pressed for post:", id);
    
    // Simple, stable animation for like button
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show heart animation for new likes only
    if (!isLiked) {
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1.3,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide heart after animation
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          heartScale.setValue(0);
        });
      });
    }

    // Call the like handler
    onLike(id);
  };

  const handleComment = () => {
    console.log("Comment button pressed for post:", id);
    
    // Simple card press animation
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the comment handler
    onComment(id);
  };

  const handleShare = () => {
    console.log("Share button pressed for post:", id);
    
    // Simple card press animation
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the share handler
    onShare(id);
  };

  const handleLongPressLike = () => {
    console.log("Long press like for reactions:", id);
    
    if (!showReactions) {
      setShowReactions(true);
      Animated.parallel([
        Animated.spring(reactionPanelScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(reactionPanelOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(reactionPanelScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(reactionPanelOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowReactions(false);
      });
    }
  };

  const handleReaction = (reactionType: string) => {
    console.log("Reaction selected:", reactionType, "for post:", id);
    
    // Animate reaction selection
    Animated.timing(likeScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    // Hide reaction panel
    Animated.parallel([
      Animated.timing(reactionPanelScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(reactionPanelOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowReactions(false);
    });

    // Call the reaction handler
    onReaction(id, reactionType);
  };

  const handleCardPress = () => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderImage = ({ item, index }: { item: PostImage; index: number }) => (
    <Image
      source={{ uri: item.uri }}
      style={[styles(theme).postImage, { width: imageWidth }]}
      resizeMode="cover"
    />
  );

  return (
    <Animated.View 
      style={[
        styles(theme).card, 
        {
          transform: [{ scale: cardScale }],
        }
      ]}
    >
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
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ff6b6b" : theme.colors.text}
              />
            </Animated.View>
            <Text style={styles(theme).actionText}>{likeCount}</Text>

            {/* Floating heart animation */}
            <Animated.View 
              style={[
                styles(theme).floatingHeart, 
                {
                  opacity: heartOpacity,
                  transform: [{ scale: heartScale }],
                }
              ]}
            >
              <Text style={styles(theme).floatingHeartText}>❤️</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleComment}
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
            onPress={handleShare}
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
            style={[
              styles(theme).reactionPanel,
              {
                opacity: reactionPanelOpacity,
                transform: [{ scale: reactionPanelScale }],
              }
            ]}
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
      elevation: 4,
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
      height: 250,
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
      alignSelf: "center",
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
    floatingHeart: {
      position: "absolute",
      top: -10,
      left: 10,
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
      elevation: 10,
    },
    reactionButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    reactionButtonText: {
      fontSize: 28,
    },
  });