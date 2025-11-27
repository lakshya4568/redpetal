/**
 * CommunityScreen - Redesigned for RedPetal V2
 * Modern post cards with optimized animations and interactions
 */

import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { communityAPI } from "../../services/api";
import AnimatedPostCard from "../components/AnimatedPostCard";
import CommentsModal from "../components/CommentsModal";
import CreatePostModalWithImages from "../components/CreatePostModalWithImages";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import { responsive, springConfigs } from "../utils/animations";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

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

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  images?: PostImage[];
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
  reactions?: Reaction[];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Memoized New Post Button
const NewPostButton = React.memo(
  ({ onPress, theme }: { onPress: () => void; theme: AppTheme }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.95, springConfigs.snappy);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, springConfigs.snappy);
    }, [scale]);

    return (
      <AnimatedPressable
        style={[styles(theme).newPostButton, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles(theme).newPostButtonText}>+ New</Text>
      </AnimatedPressable>
    );
  }
);

NewPostButton.displayName = "NewPostButton";

export default function CommunityScreen() {
  const { theme } = useThemeContext();
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  // Animate header on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
    headerTranslateY.value = withSpring(0, springConfigs.gentle);
  }, [headerOpacity, headerTranslateY]);

  // Fetch posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getPosts({
        limit: 50,
        offset: 0,
      });

      // Transform API response to match component interface
      const transformedPosts = response.posts.map(
        (post: Record<string, unknown>) => ({
          id: post.id,
          author: post.is_anonymous
            ? "Anonymous"
            : post.first_name && post.last_name
            ? `${post.first_name} ${post.last_name}`
            : post.username,
          avatar:
            (post.profile_image_url as string) ||
            "https://randomuser.me/api/portraits/women/10.jpg",
          content: post.content,
          images: post.images || [],
          likes: (post.like_count as number) || 0,
          comments: [],
          timestamp: formatTimestamp(post.created_at as string),
          isLiked: (post.is_liked as boolean) || false,
          reactions: [],
        })
      );

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      Alert.alert("Error", "Failed to load community posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleCreatePost = async (
    content: string,
    images: PostImage[] = []
  ) => {
    try {
      const imageUrls = images.map((img) => img.uri);
      await communityAPI.createPost({
        content,
        images: imageUrls,
        category: "general",
      });

      Alert.alert("Success", "Your post has been shared with the community!");
      loadPosts();
    } catch (error: unknown) {
      Alert.alert("Error", (error as Error).message || "Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await communityAPI.likePost(postId);

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    } catch (error: unknown) {
      Alert.alert("Error", (error as Error).message || "Failed to like post");
    }
  };

  const handleComment = async (postId: string) => {
    try {
      const response = await communityAPI.getComments(postId);

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: response.comments.map(
                  (comment: Record<string, unknown>) => ({
                    id: comment.id,
                    author: comment.is_anonymous
                      ? "Anonymous"
                      : comment.first_name && comment.last_name
                      ? `${comment.first_name} ${comment.last_name}`
                      : comment.username,
                    content: comment.content,
                    timestamp: formatTimestamp(comment.created_at as string),
                  })
                ),
              }
            : post
        )
      );

      setSelectedPostId(postId);
      setCommentsVisible(true);
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        (error as Error).message || "Failed to load comments"
      );
    }
  };

  const handleShare = (postId: string) => {
    Alert.alert("Shared!", "Post link copied to clipboard");
  };

  const handleReaction = (postId: string, reactionType: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const existingReaction = post.reactions?.find(
            (r) => r.type === reactionType
          );
          let updatedReactions = post.reactions || [];

          if (existingReaction) {
            updatedReactions = updatedReactions.map((r) =>
              r.type === reactionType ? { ...r, count: r.count + 1 } : r
            );
          } else {
            const reactionEmojis: { [key: string]: string } = {
              like: "👍",
              love: "❤️",
              laugh: "😂",
              wow: "😮",
              sad: "😢",
              angry: "😠",
            };

            const newReaction: Reaction = {
              id: Date.now().toString(),
              type: reactionType as Reaction["type"],
              emoji: reactionEmojis[reactionType] || "👍",
              count: 1,
            };
            updatedReactions = [...updatedReactions, newReaction];
          }

          return { ...post, reactions: updatedReactions };
        }
        return post;
      })
    );
  };

  const handleAddComment = async (comment: string) => {
    if (selectedPostId) {
      try {
        await communityAPI.addComment(selectedPostId, {
          content: comment,
          is_anonymous: false,
        });

        await handleComment(selectedPostId);
        Alert.alert("Success", "Comment added successfully!");
      } catch (error: unknown) {
        Alert.alert(
          "Error",
          (error as Error).message || "Failed to add comment"
        );
      }
    }
  };

  const selectedPost = posts.find((post) => post.id === selectedPostId);

  // Animated header style
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Render post item
  const renderPostItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <AnimatedPostCard
        id={item.id}
        username={item.author}
        profileImage={item.avatar}
        content={item.content}
        images={item.images || []}
        timestamp={item.timestamp}
        likeCount={item.likes}
        commentCount={item.comments.length}
        isLiked={item.isLiked}
        reactions={item.reactions || []}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onReaction={handleReaction}
      />
    ),
    [handleLike, handleComment, handleShare, handleReaction]
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  if (loading && !refreshing) {
    return (
      <View style={styles(theme).container}>
        <Animated.View style={[styles(theme).header, headerAnimatedStyle]}>
          <Text style={styles(theme).title}>Community</Text>
          <NewPostButton
            onPress={() => setCreatePostVisible(true)}
            theme={theme}
          />
        </Animated.View>
        <View style={styles(theme).loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles(theme).loadingText}>Loading posts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      {/* Header */}
      <Animated.View style={[styles(theme).header, headerAnimatedStyle]}>
        <Text style={styles(theme).title}>Community</Text>
        <NewPostButton
          onPress={() => setCreatePostVisible(true)}
          theme={theme}
        />
      </Animated.View>

      {posts.length === 0 ? (
        <View style={styles(theme).emptyContainer}>
          <Text style={styles(theme).emptyIcon}>💬</Text>
          <Text style={styles(theme).emptyText}>No posts yet</Text>
          <Text style={styles(theme).emptySubtext}>
            Be the first to share something with the community!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles(theme).postList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <CreatePostModalWithImages
        visible={createPostVisible}
        onClose={() => setCreatePostVisible(false)}
        onSubmit={handleCreatePost}
      />

      <CommentsModal
        visible={commentsVisible}
        onClose={() => {
          setCommentsVisible(false);
          setSelectedPostId(null);
        }}
        comments={selectedPost?.comments || []}
        onAddComment={handleAddComment}
      />
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop:
        Platform.OS === "android" ? responsive.sp(50) : responsive.sp(60),
      paddingBottom: responsive.sp(16),
      paddingHorizontal: responsive.sp(20),
      backgroundColor: theme.colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.borderLight,
    },
    title: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(28),
      fontWeight: "700",
      color: theme.colors.text,
    },
    newPostButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: responsive.sp(10),
      paddingHorizontal: responsive.sp(18),
      borderRadius: responsive.sp(20),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    newPostButtonText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      fontWeight: "600",
      color: theme.colors.textOnPrimary,
    },
    postList: {
      paddingTop: responsive.sp(12),
      paddingHorizontal: responsive.sp(16),
      paddingBottom: responsive.sp(100),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: responsive.sp(32),
    },
    loadingText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(16),
      color: theme.colors.textSecondary,
      marginTop: responsive.sp(16),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: responsive.sp(32),
    },
    emptyIcon: {
      fontSize: responsive.sp(48),
      marginBottom: responsive.sp(16),
    },
    emptyText: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(20),
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: responsive.sp(8),
    },
    emptySubtext: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      color: theme.colors.textMuted,
      textAlign: "center",
      maxWidth: responsive.wp(70),
    },
  });
