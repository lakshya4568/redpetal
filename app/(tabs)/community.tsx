/**
 * CommunityScreen — Red Petal Community Hub
 * Redesigned to match Stitch community design
 * Features: Search, Trending Circles, Post Feed, Compose FAB
 */

import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import TrendingCircle from "../components/TrendingCircle";

// Mock data
const TRENDING_CIRCLES = [
  { id: "1", label: "PCOS\nSupport", icon: "💗", color: "#ee2b3b", bgColor: "#fce4ec" },
  { id: "2", label: "First\nPeriod", icon: "📖", color: "#e65100", bgColor: "#fff3e0" },
  { id: "3", label: "Cycle\nSync", icon: "🔄", color: "#2e7d32", bgColor: "#e8f5e9" },
  { id: "4", label: "Mindfulness", icon: "🌿", color: "#1565c0", bgColor: "#e3f2fd" },
  { id: "5", label: "Nutrition", icon: "🥗", color: "#6a1b9a", bgColor: "#f3e5f5" },
];

const POSTS = [
  {
    id: "1",
    author: "Elena R.",
    time: "2 hours ago",
    tag: "Shared Wisdom",
    tagColor: "#ee2b3b",
    tagBg: "#fce4ec",
    title: "My journey with cycle-syncing yoga",
    excerpt:
      "After three months of adjusting my practice to my phases, I've noticed a significant drop in my day 1 fatigue...",
    likes: 124,
    comments: 18,
  },
  {
    id: "2",
    author: "Maya Chen",
    time: "5 hours ago",
    tag: "Support",
    tagColor: "#2e7d32",
    tagBg: "#e8f5e9",
    title: "Finding the right magnesium supplement?",
    excerpt:
      "Does anyone have recommendations for a brand that doesn't cause stomach upset? Trying to help with cramps.",
    likes: 42,
    comments: 31,
  },
  {
    id: "3",
    author: "Sasha K.",
    time: "Yesterday",
    tag: "Story",
    tagColor: "#e65100",
    tagBg: "#fff3e0",
    title: "A message to my younger self...",
    excerpt:
      "I wish I knew that it was okay to rest during my period. For years I pushed through and felt burnt out...",
    likes: 256,
    comments: 45,
  },
];

export default function CommunityScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const renderPostCard = (post: typeof POSTS[0], index: number) => (
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
          <Text style={styles(theme).authorName}>{post.author}</Text>
          <Text style={styles(theme).authorTime}>{post.time}</Text>
        </View>
        <View style={[styles(theme).tagBadge, { backgroundColor: post.tagBg }]}>
          <Text style={[styles(theme).tagText, { color: post.tagColor }]}>
            {post.tag}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles(theme).postTitle}>{post.title}</Text>
      <Text style={styles(theme).postExcerpt} numberOfLines={2}>
        {post.excerpt}
      </Text>

      {/* Stats */}
      <View style={styles(theme).statsRow}>
        <View style={styles(theme).statItem}>
          <FontAwesome name="heart" size={13} color={theme.colors.textMuted} />
          <Text style={styles(theme).statCount}>{post.likes}</Text>
        </View>
        <View style={styles(theme).statItem}>
          <FontAwesome name="comment" size={13} color={theme.colors.textMuted} />
          <Text style={styles(theme).statCount}>{post.comments}</Text>
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
          <View style={{ gap: 12 }}>
            {POSTS.map((post, idx) => renderPostCard(post, idx))}
          </View>
        </Animated.View>

        {/* Bottom spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Compose Button */}
      <TouchableOpacity
        style={styles(theme).composeFab}
        activeOpacity={0.8}
      >
        <FontAwesome name="pencil" size={22} color="#FFF" />
      </TouchableOpacity>
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
