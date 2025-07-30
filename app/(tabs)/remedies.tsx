import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeContext } from "../components/ThemeContext";
import { remediesAPI } from "../services/api";
import { useFocusEffect } from "expo-router";

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
  { key: 'all', label: 'All', icon: '🌿' },
  { key: 'cramps', label: 'Cramps', icon: '💊' },
  { key: 'bloating', label: 'Bloating', icon: '🫧' },
  { key: 'mood', label: 'Mood', icon: '😌' },
  { key: 'headaches', label: 'Headaches', icon: '🤕' },
  { key: 'nausea', label: 'Nausea', icon: '🤢' },
  { key: 'fatigue', label: 'Fatigue', icon: '😴' },
  { key: 'skin', label: 'Skin', icon: '✨' },
];

export default function RemediesScreen() {
  const { theme } = useThemeContext();
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch remedies when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRemedies();
    }, [selectedCategory, searchQuery])
  );

  const loadRemedies = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 50,
        offset: 0,
        sort_by: 'effectiveness_rating',
        sort_order: 'DESC'
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await remediesAPI.getRemedies(params);
      setRemedies(response.remedies || []);
    } catch (error: any) {
      console.error('Error loading remedies:', error);
      Alert.alert('Error', 'Failed to load remedies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRemedies();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome key={i} name="star" size={16} color={theme.colors.warning} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FontAwesome key={i} name="star-half-empty" size={16} color={theme.colors.warning} />
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={16} color={theme.colors.textMuted} />
        );
      }
    }
    
    return <View style={styles(theme).starsContainer}>{stars}</View>;
  };

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles(theme).categoryChip,
        selectedCategory === item.key && styles(theme).categoryChipSelected,
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <Text style={styles(theme).categoryEmoji}>{item.icon}</Text>
      <Text
        style={[
          styles(theme).categoryText,
          selectedCategory === item.key && styles(theme).categoryTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderRemedy = ({ item }: { item: Remedy }) => (
    <TouchableOpacity style={styles(theme).remedyCard}>
      <View style={styles(theme).remedyHeader}>
        <Text style={styles(theme).remedyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles(theme).ratingContainer}>
          {renderStars(item.effectiveness_rating)}
          <Text style={styles(theme).ratingText}>
            ({item.total_ratings})
          </Text>
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
        <Text style={styles(theme).authorText}>
          by {item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const styles = (theme: any) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      header: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
      },
      title: {
        ...theme.typography.headlineLarge,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
      },
      subtitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      },
      categoriesContainer: {
        paddingVertical: theme.spacing.md,
      },
      categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
      },
      categoryChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      categoryEmoji: {
        fontSize: 16,
        marginRight: theme.spacing.xs / 2,
      },
      categoryText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text,
        fontWeight: '500',
      },
      categoryTextSelected: {
        color: theme.colors.textOnPrimary,
      },
      content: {
        flex: 1,
        padding: theme.spacing.lg,
      },
      remedyCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
      },
      remedyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
      },
      remedyTitle: {
        ...theme.typography.titleMedium,
        color: theme.colors.text,
        flex: 1,
        marginRight: theme.spacing.md,
      },
      ratingContainer: {
        alignItems: 'flex-end',
      },
      starsContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.xs / 2,
      },
      ratingText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
      },
      remedyDescription: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        marginBottom: theme.spacing.md,
      },
      remedyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      categoryTag: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs / 2,
        borderRadius: theme.borderRadius.sm,
      },
      categoryTagText: {
        ...theme.typography.labelSmall,
        color: theme.colors.textOnPrimary,
        fontWeight: '600',
      },
      authorText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
      },
      loadingText: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
      },
      emptyText: {
        ...theme.typography.headlineSmall,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
      },
      emptySubtext: {
        ...theme.typography.bodyMedium,
        color: theme.colors.textMuted,
        textAlign: 'center',
      },
      addButton: {
        position: 'absolute',
        bottom: theme.spacing.xl,
        right: theme.spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.lg,
      },
    });

  if (loading && !refreshing) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(theme).loadingText}>Loading remedies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      {/* Header */}
      <View style={styles(theme).header}>
        <Text style={styles(theme).title}>Home Remedies</Text>
        <Text style={styles(theme).subtitle}>
          Natural solutions for period relief
        </Text>
      </View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
        }}
        style={styles(theme).categoriesContainer}
      />

      {/* Remedies List */}
      <View style={styles(theme).content}>
        {remedies.length === 0 ? (
          <View style={styles(theme).emptyContainer}>
            <Text style={styles(theme).emptyText}>
              No remedies found
            </Text>
            <Text style={styles(theme).emptySubtext}>
              {selectedCategory === 'all' 
                ? 'Be the first to share a remedy!'
                : `No remedies in ${selectedCategory} category yet.`
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={remedies}
            renderItem={renderRemedy}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles(theme).addButton}
        onPress={() => Alert.alert('Coming Soon', 'Add remedy feature will be available soon!')}
      >
        <FontAwesome name="plus" size={24} color={theme.colors.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}