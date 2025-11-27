/**
 * RemediesScreen - Redesigned for RedPetal V2
 * Category filters and remedy cards with clean animations
 */

import { FontAwesome } from "@expo/vector-icons";
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
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { remediesAPI } from "../../services/api";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import { responsive, springConfigs, timingConfigs } from "../utils/animations";

interface Remedy {
  id: string;
  title: string;
  description: string;
  category: string;
  effectiveness_rating: number;
  total_ratings: number;
  username: string;
  created_at: string;
}

const CATEGORIES = [
  { key: "all", label: "All", icon: "🌿" },
  { key: "cramps", label: "Cramps", icon: "💊" },
  { key: "bloating", label: "Bloating", icon: "🫧" },
  { key: "mood", label: "Mood", icon: "😌" },
  { key: "headaches", label: "Headaches", icon: "🤕" },
  { key: "nausea", label: "Nausea", icon: "🤢" },
  { key: "fatigue", label: "Fatigue", icon: "😴" },
  { key: "skin", label: "Skin", icon: "✨" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Memoized Category Chip
const CategoryChip = React.memo(
  ({
    item,
    isSelected,
    onPress,
    index,
    theme,
  }: {
    item: (typeof CATEGORIES)[0];
    isSelected: boolean;
    onPress: () => void;
    index: number;
    theme: AppTheme;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
      const delay = index * 50;
      opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
      translateY.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    }, [index, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.95, springConfigs.snappy);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, springConfigs.snappy);
    }, [scale]);

    return (
      <AnimatedPressable
        style={[
          styles(theme).categoryChip,
          isSelected && styles(theme).categoryChipSelected,
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles(theme).categoryEmoji}>{item.icon}</Text>
        <Text
          style={[
            styles(theme).categoryText,
            isSelected && styles(theme).categoryTextSelected,
          ]}
        >
          {item.label}
        </Text>
      </AnimatedPressable>
    );
  }
);

CategoryChip.displayName = "CategoryChip";

// Memoized Remedy Card
const RemedyCard = React.memo(
  ({
    item,
    index,
    theme,
    renderStars,
  }: {
    item: Remedy;
    index: number;
    theme: AppTheme;
    renderStars: (rating: number) => React.ReactNode;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-20);

    useEffect(() => {
      const delay = 100 + index * 80;
      opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
      translateX.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    }, [index, opacity, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, springConfigs.snappy);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, springConfigs.snappy);
    }, [scale]);

    return (
      <AnimatedPressable
        style={[styles(theme).remedyCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles(theme).remedyHeader}>
          <Text style={styles(theme).remedyTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles(theme).ratingContainer}>
            {renderStars(item.effectiveness_rating)}
            <Text style={styles(theme).ratingText}>({item.total_ratings})</Text>
          </View>
        </View>

        <Text style={styles(theme).remedyDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles(theme).remedyFooter}>
          <View style={styles(theme).categoryTag}>
            <Text style={styles(theme).categoryTagText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
          <Text style={styles(theme).authorText}>by {item.username}</Text>
        </View>
      </AnimatedPressable>
    );
  }
);

RemedyCard.displayName = "RemedyCard";

export default function RemediesScreen() {
  const { theme } = useThemeContext();
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Animation values
  const headerOpacity = useSharedValue(0);
  const fabScale = useSharedValue(0);

  // Animate header on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
    fabScale.value = withDelay(500, withSpring(1, springConfigs.bouncy));
  }, [headerOpacity, fabScale]);

  // Fetch remedies when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRemedies();
    }, [selectedCategory, searchQuery])
  );

  const loadRemedies = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        limit: 50,
        offset: 0,
        sort_by: "effectiveness_rating",
        sort_order: "DESC",
      };

      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await remediesAPI.getRemedies(params);
      setRemedies(response.remedies || []);
    } catch (error) {
      console.error("Error loading remedies:", error);
      Alert.alert("Error", "Failed to load remedies");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRemedies();
  };

  const renderStars = useCallback(
    (rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars.push(
            <FontAwesome
              key={i}
              name="star"
              size={responsive.sp(14)}
              color={theme.colors.warning}
            />
          );
        } else if (i === fullStars && hasHalfStar) {
          stars.push(
            <FontAwesome
              key={i}
              name="star-half-empty"
              size={responsive.sp(14)}
              color={theme.colors.warning}
            />
          );
        } else {
          stars.push(
            <FontAwesome
              key={i}
              name="star-o"
              size={responsive.sp(14)}
              color={theme.colors.textMuted}
            />
          );
        }
      }

      return <View style={styles(theme).starsContainer}>{stars}</View>;
    },
    [theme]
  );

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          headerOpacity.value,
          [0, 1],
          [-20, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Render category item
  const renderCategory = useCallback(
    ({ item, index }: { item: (typeof CATEGORIES)[0]; index: number }) => (
      <CategoryChip
        item={item}
        isSelected={selectedCategory === item.key}
        onPress={() => setSelectedCategory(item.key)}
        index={index}
        theme={theme}
      />
    ),
    [selectedCategory, theme]
  );

  // Render remedy item
  const renderRemedy = useCallback(
    ({ item, index }: { item: Remedy; index: number }) => (
      <RemedyCard
        item={item}
        index={index}
        theme={theme}
        renderStars={renderStars}
      />
    ),
    [theme, renderStars]
  );

  const categoryKeyExtractor = useCallback(
    (item: (typeof CATEGORIES)[0]) => item.key,
    []
  );

  const remedyKeyExtractor = useCallback((item: Remedy) => item.id, []);

  if (loading && !refreshing) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(theme).loadingText}>Loading remedies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles(theme).container} edges={["top"]}>
      {/* Header */}
      <Animated.View style={[styles(theme).header, headerAnimatedStyle]}>
        <Text style={styles(theme).title}>Home Remedies</Text>
        <Text style={styles(theme).subtitle}>
          Natural solutions for period relief
        </Text>
      </Animated.View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={categoryKeyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles(theme).categoriesContent}
        style={styles(theme).categoriesContainer}
      />

      {/* Remedies List */}
      <View style={styles(theme).content}>
        {remedies.length === 0 ? (
          <View style={styles(theme).emptyContainer}>
            <Text style={styles(theme).emptyIcon}>🌸</Text>
            <Text style={styles(theme).emptyText}>No remedies found</Text>
            <Text style={styles(theme).emptySubtext}>
              {selectedCategory === "all"
                ? "Be the first to share a remedy!"
                : `No remedies in ${selectedCategory} category yet.`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={remedies}
            renderItem={renderRemedy}
            keyExtractor={remedyKeyExtractor}
            contentContainerStyle={styles(theme).remediesList}
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
      </View>

      {/* FAB */}
      <AnimatedPressable
        style={[styles(theme).fab, fabAnimatedStyle]}
        onPress={() =>
          Alert.alert(
            "Coming Soon",
            "Add remedy feature will be available soon!"
          )
        }
      >
        <FontAwesome
          name="plus"
          size={responsive.sp(22)}
          color={theme.colors.textOnPrimary}
        />
      </AnimatedPressable>
    </SafeAreaView>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: responsive.sp(20),
      paddingTop: responsive.sp(16),
      paddingBottom: responsive.sp(12),
    },
    title: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(28),
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: responsive.sp(4),
    },
    subtitle: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    categoriesContainer: {
      maxHeight: responsive.sp(100),
    },
    categoriesContent: {
      paddingHorizontal: responsive.sp(16),
      paddingVertical: responsive.sp(12),
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: responsive.sp(16),
      paddingVertical: responsive.sp(12),
      borderRadius: responsive.sp(20),
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      marginRight: responsive.sp(10),
      backgroundColor: theme.colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    categoryChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryEmoji: {
      fontSize: responsive.fs(16),
      marginRight: responsive.sp(6),
    },
    categoryText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      color: theme.colors.text,
      fontWeight: "500",
    },
    categoryTextSelected: {
      color: theme.colors.textOnPrimary,
    },
    content: {
      flex: 1,
    },
    remediesList: {
      paddingHorizontal: responsive.sp(16),
      paddingBottom: responsive.sp(100),
    },
    remedyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: responsive.sp(16),
      padding: responsive.sp(16),
      marginBottom: responsive.sp(12),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    remedyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: responsive.sp(10),
    },
    remedyTitle: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(16),
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
      marginRight: responsive.sp(12),
    },
    ratingContainer: {
      alignItems: "flex-end",
    },
    starsContainer: {
      flexDirection: "row",
      marginBottom: responsive.sp(2),
      gap: responsive.sp(2),
    },
    ratingText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(11),
      color: theme.colors.textMuted,
    },
    remedyDescription: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      color: theme.colors.textSecondary,
      lineHeight: responsive.fs(20),
      marginBottom: responsive.sp(12),
    },
    remedyFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryTag: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: responsive.sp(10),
      paddingVertical: responsive.sp(4),
      borderRadius: responsive.sp(8),
    },
    categoryTagText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(11),
      color: theme.colors.primary,
      fontWeight: "600",
    },
    authorText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(12),
      color: theme.colors.textMuted,
      fontStyle: "italic",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
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
    fab: {
      position: "absolute",
      bottom: responsive.sp(100),
      right: responsive.sp(20),
      width: responsive.sp(56),
      height: responsive.sp(56),
      borderRadius: responsive.sp(28),
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  });
