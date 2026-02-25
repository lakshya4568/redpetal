/**
 * CommunityScreen — Red Petal Community Hub
 * Redesigned to match Stitch community design
 * Connected to GET/POST /api/community/posts
 */

import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { communityAPI } from "../../services/api";
import { useAuth } from "../../services/auth";
import CreatePostModalWithImages from "../components/CreatePostModalWithImages";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import TrendingCircle from "../components/TrendingCircle";

// Static trending circles
const TRENDING_CIRCLES = [
  { id: "1", label: "PCOS\nSupport", icon: "💗", color: "#ee2b3b", bgColor: "#fce4ec" },
  { id: "2", label: "First\nPeriod", icon: "📖", color: "#e65100", bgColor: "#fff3e0" },
  { id: "3", label: "Cycle\nSync", icon: "🔄", color: "#2e7d32", bgColor: "#e8f5e9" },
  { id: "4", label: "Mindfulness", icon: "🌿", color: "#1565c0", bgColor: "#e3f2fd" },
  { id: "5", label: "Nutrition", icon: "🥗", color: "#6a1b9a", bgColor: "#f3e5f5" },
];

// Tag color mapping
const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  "shared wisdom": { color: "#ee2b3b", bg: "#fce4ec" },
  support: { color: "#2e7d32", bg: "#e8f5e9" },
  story: { color: "#e65100", bg: "#fff3e0" },
  question: { color: "#1565c0", bg: "#e3f2fd" },
  default: { color: "#6a1b9a", bg: "#f3e5f5" },
};

interface Post {
  id: string;
  title?: string;
  content: string;
  category?: string;
  username: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_liked?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function CommunityScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch posts on focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getPosts({ limit: 20, offset: 0 });
      setPosts(response.posts || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (user?.id === "guest") {
      Alert.alert("Sign in Required", "Please sign in to like posts.");
      return;
    }
    try {
      await communityAPI.likePost(postId);
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              likes_count: p.user_liked
                ? p.likes_count - 1
                : p.likes_count + 1,
              user_liked: !p.user_liked,
            }
            : p
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handlePostSubmit = async (content: string, _images: any[]) => {
    try {
      await communityAPI.createPost({
        content,
        category: "shared wisdom",
        is_anonymous: false,
      });
      setShowCreateModal(false);
      loadPosts(); // Refresh the list
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  // Filter posts by search query
  const filteredPosts = searchQuery.trim()
    ? posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : posts;

  const getTagStyle = (category?: string) => {
    const key = (category || "").toLowerCase();
    return TAG_COLORS[key] || TAG_COLORS.default;
  };

  const renderPostCard = (post: Post, index: number) => (
    <Animated.View
      key={post.id}
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={styles(theme).postCard}
    >
      {/* Author row */}
      <View style={styles(theme).authorRow}>
        <View style={styles(theme).authorAvatarPlaceholder}>
          <FontAwesome name="user" size={14} color={theme.colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles(theme).authorName}>
            {post.is_anonymous ? "Anonymous" : post.username}
          </Text>
          <Text style={styles(theme).authorTime}>
            {timeAgo(post.created_at)}
          </Text>
        </View>
        {post.category && (
          <View
            style={[
              styles(theme).tagBadge,
              { backgroundColor: getTagStyle(post.category).bg },
            ]}
          >
            <Text
              style={[
                styles(theme).tagText,
                { color: getTagStyle(post.category).color },
              ]}
            >
              {post.category}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      {post.title && (
        <Text style={styles(theme).postTitle}>{post.title}</Text>
      )}
      <Text style={styles(theme).postExcerpt} numberOfLines={2}>
        {post.content}
      </Text>

      {/* Stats */}
      <View style={styles(theme).statsRow}>
        <TouchableOpacity
          style={styles(theme).statItem}
          onPress={() => handleLike(post.id)}
          activeOpacity={0.7}
        >
          <FontAwesome
            name={post.user_liked ? "heart" : "heart-o"}
            size={13}
            color={
              post.user_liked ? theme.colors.primary : theme.colors.textMuted
            }
          />
          <Text style={styles(theme).statCount}>{post.likes_count}</Text>
        </TouchableOpacity>
        <View style={styles(theme).statItem}>
          <FontAwesome name="comment" size={13} color={theme.colors.textMuted} />
          <Text style={styles(theme).statCount}>{post.comments_count}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles(theme).screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles(theme).scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles(theme).header}
        >
          <Text style={styles(theme).headerTitle}>Community</Text>
          <TouchableOpacity style={styles(theme).notificationBtn}>
            <FontAwesome
              name="bell-o"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Search */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles(theme).searchContainer}
        >
          <FontAwesome
            name="search"
            size={16}
            color={theme.colors.textMuted}
            style={{ marginLeft: 16 }}
          />
          <TextInput
            style={styles(theme).searchInput}
            placeholder="Search circles or posts..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Trending Circles */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles(theme).sectionLabel}>TRENDING CIRCLES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles(theme).circlesRow}
          >
            {TRENDING_CIRCLES.map((circle, idx) => (
              <Animated.View
                key={circle.id}
                entering={FadeInRight.delay(idx * 80).duration(300)}
              >
                <TrendingCircle
                  label={circle.label}
                  icon={circle.icon}
                  color={circle.color}
                  bgColor={circle.bgColor}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Recent Conversations */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles(theme).sectionLabel}>RECENT CONVERSATIONS</Text>

          {loading && !refreshing ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 12,
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body.family,
                  fontSize: 13,
                }}
              >
                Loading posts...
              </Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🌸</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.body.family,
                  marginBottom: 6,
                }}
              >
                {searchQuery ? "No matching posts" : "No posts yet"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body.family,
                  textAlign: "center",
                }}
              >
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to start a conversation!"}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredPosts.map((post, idx) => renderPostCard(post, idx))}
            </View>
          )}
        </Animated.View>

        {/* Bottom spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Compose Button */}
      <TouchableOpacity
        style={styles(theme).composeFab}
        activeOpacity={0.8}
        onPress={() => {
          if (user?.id === "guest") {
            Alert.alert("Sign in Required", "Please sign in to create posts.");
            return;
          }
          setShowCreateModal(true);
        }}
      >
        <FontAwesome name="pencil" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModalWithImages
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handlePostSubmit}
      />
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: theme.fonts.subtitle.family,
      color: theme.colors.text,
    },
    notificationBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.text,
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      letterSpacing: 2,
      color: theme.colors.textMuted,
      marginBottom: 16,
    },
    circlesRow: {
      gap: 20,
      paddingBottom: 24,
    },
    postCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    authorAvatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.borderLight,
      alignItems: "center",
      justifyContent: "center",
    },
    authorName: {
      fontSize: 12,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
    },
    authorTime: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textMuted,
    },
    tagBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    tagText: {
      fontSize: 9,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    postTitle: {
      fontSize: 17,
      fontFamily: theme.fonts.title.family,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: 6,
    },
    postExcerpt: {
      fontSize: 12,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: "row",
      gap: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statCount: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.textMuted,
    },
    composeFab: {
      position: "absolute",
      bottom: 100,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      // Petal shape approximation
      borderTopLeftRadius: 16,
      borderTopRightRadius: 28,
      borderBottomRightRadius: 28,
      borderBottomLeftRadius: 16,
    },
  });
