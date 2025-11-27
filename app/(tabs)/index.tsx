/**
 * HomeScreen - Redesigned for RedPetal V2
 * Optimized with proper virtualization, lazy loading, and 60fps animations
 */

import React, { useCallback } from "react";
import {
  FlatList,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import ArticleCard from "../components/ArticleCard";
import CalendarHeader from "../components/CalendarHeader";
import CycleSummaryCard from "../components/CycleSummaryCard";
import FeatureEntryCard from "../components/FeatureEntryCard";
import InsightCard from "../components/InsightCard";
import NotesCard from "../components/NotesCard";
import PeriodTrackerCard from "../components/PeriodTrackerCard";
import SectionHeader from "../components/SectionHeader";
import SymptomPatternsCard from "../components/SymptomPatternsCard";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import { responsive } from "../utils/animations";

// Static data - moved outside component to prevent re-creation
const insights = [
  { id: "1", title: "Time for a pregnancy test?", icon: "🧪" },
  { id: "2", title: "Early pregnancy or PMS symptoms?", icon: "🤔" },
  { id: "3", title: "Coping with pregnancy paranoia", icon: "🧘" },
];

const cycleArticles = [
  { id: "1", title: "What counts as a late period?", readTime: "7 min read" },
  {
    id: "2",
    title: "Cramps but no period? This could be why",
    readTime: "6 min read",
  },
  {
    id: "3",
    title: "5 late period 'remedies' to avoid",
    readTime: "11 min read",
  },
];

const featureCards = [
  {
    id: "petal-find",
    title: "Petal Find",
    description: "Find safe and clean washrooms near you",
    icon: "map-marker" as const,
    route: "/features/map",
  },
  {
    id: "doctor-connect",
    title: "Doctor Connect",
    description: "Book appointments with healthcare specialists",
    icon: "user-md" as const,
    route: "/features/doctors",
  },
  {
    id: "sister-ai",
    title: "Sister AI",
    description: "Your caring Hinglish health assistant",
    icon: "comments" as const,
    comingSoon: true,
  },
];

// Section types for the main list
type SectionType =
  | "calendar"
  | "tracker"
  | "quickAccess"
  | "insights"
  | "mainArticle"
  | "cycleArticles"
  | "summary"
  | "patterns"
  | "notes"
  | "spacer";

interface SectionItem {
  id: string;
  type: SectionType;
}

const sections: SectionItem[] = [
  { id: "calendar", type: "calendar" },
  { id: "tracker", type: "tracker" },
  { id: "quickAccess", type: "quickAccess" },
  { id: "insights", type: "insights" },
  { id: "mainArticle", type: "mainArticle" },
  { id: "cycleArticles", type: "cycleArticles" },
  { id: "summary", type: "summary" },
  { id: "patterns", type: "patterns" },
  { id: "notes", type: "notes" },
  { id: "spacer", type: "spacer" },
];

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<SectionItem>
);

// Memoized insight item renderer
const InsightItem = React.memo(
  ({ item, index }: { item: (typeof insights)[0]; index: number }) => (
    <InsightCard
      title={item.title}
      icon={<Text style={{ fontSize: responsive.sp(28) }}>{item.icon}</Text>}
      index={index}
    />
  )
);

InsightItem.displayName = "InsightItem";

// Memoized article item renderer
const ArticleItem = React.memo(
  ({ item, theme }: { item: (typeof cycleArticles)[0]; theme: AppTheme }) => (
    <View style={styles(theme).articleItem}>
      <ArticleCard
        title={item.title}
        image={require("../../assets/images/floral-background.png")}
        height={responsive.hp(18)}
      />
      <Text style={styles(theme).readTime}>{item.readTime}</Text>
    </View>
  )
);

ArticleItem.displayName = "ArticleItem";

export default function HomeScreen() {
  const { theme } = useThemeContext();
  const scrollY = useSharedValue(0);

  // Scroll handler for potential parallax/header effects
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Memoized insight list key extractor
  const insightKeyExtractor = useCallback(
    (item: (typeof insights)[0]) => item.id,
    []
  );

  // Memoized article list key extractor
  const articleKeyExtractor = useCallback(
    (item: (typeof cycleArticles)[0]) => item.id,
    []
  );

  // Memoized insight render item
  const renderInsightItem = useCallback(
    ({ item, index }: { item: (typeof insights)[0]; index: number }) => (
      <InsightItem item={item} index={index} />
    ),
    []
  );

  // Memoized article render item
  const renderArticleItem = useCallback(
    ({ item }: { item: (typeof cycleArticles)[0] }) => (
      <ArticleItem item={item} theme={theme} />
    ),
    [theme]
  );

  // Main section renderer
  const renderSection: ListRenderItem<SectionItem> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "calendar":
          return <CalendarHeader />;

        case "tracker":
          return (
            <PeriodTrackerCard daysLate={3} cycleDay={31} totalCycleDays={28} />
          );

        case "quickAccess":
          return (
            <>
              <SectionHeader title="Quick Access" />
              {featureCards.map((card, index) => (
                <FeatureEntryCard
                  key={card.id}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  route={card.route}
                  comingSoon={card.comingSoon}
                  index={index}
                  gradientColors={
                    card.comingSoon
                      ? [theme.colors.accent, theme.colors.primary]
                      : undefined
                  }
                />
              ))}
            </>
          );

        case "insights":
          return (
            <>
              <SectionHeader title="My daily insights" />
              <FlatList
                horizontal
                data={insights}
                renderItem={renderInsightItem}
                keyExtractor={insightKeyExtractor}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles(theme).horizontalListContent}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                removeClippedSubviews={Platform.OS === "android"}
              />
            </>
          );

        case "mainArticle":
          return (
            <View style={styles(theme).mainArticleContainer}>
              <ArticleCard
                title="Am I pregnant?"
                items={[
                  "8 early signs of pregnancy",
                  "Taking a pregnancy test",
                  "Other reasons you're late",
                ]}
                image={require("../../assets/images/floral-background.png")}
              />
            </View>
          );

        case "cycleArticles":
          return (
            <>
              <SectionHeader title="Based on your current cycle" />
              <FlatList
                horizontal
                data={cycleArticles}
                renderItem={renderArticleItem}
                keyExtractor={articleKeyExtractor}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles(theme).horizontalListContent}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                removeClippedSubviews={Platform.OS === "android"}
              />
            </>
          );

        case "summary":
          return (
            <>
              <SectionHeader title="Cycle summary" />
              <CycleSummaryCard />
            </>
          );

        case "patterns":
          return (
            <>
              <SectionHeader title="My symptom patterns" />
              <SymptomPatternsCard />
            </>
          );

        case "notes":
          return <NotesCard />;

        case "spacer":
          return <View style={styles(theme).bottomSpacer} />;

        default:
          return null;
      }
    },
    [
      theme,
      renderInsightItem,
      renderArticleItem,
      insightKeyExtractor,
      articleKeyExtractor,
    ]
  );

  // Section key extractor
  const sectionKeyExtractor = useCallback((item: SectionItem) => item.id, []);

  // Get item layout for better scroll performance
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: responsive.hp(30), // Approximate item height
      offset: responsive.hp(30) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles(theme).container}>
      <AnimatedFlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={sectionKeyExtractor}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={styles(theme).listContent}
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
    listContent: {
      paddingBottom: responsive.sp(100), // Space for floating tab bar
    },
    horizontalListContent: {
      paddingHorizontal: responsive.sp(14),
    },
    mainArticleContainer: {
      paddingHorizontal: responsive.sp(20),
      marginTop: responsive.sp(8),
    },
    articleItem: {
      marginRight: responsive.sp(12),
      width: responsive.wp(60),
    },
    readTime: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(12),
      color: theme.colors.textSecondary,
      marginTop: responsive.sp(8),
      marginLeft: responsive.sp(4),
    },
    bottomSpacer: {
      height: responsive.sp(20),
    },
  });
