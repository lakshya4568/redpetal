import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
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

const insights = [
  { title: "Time for a pregnancy test?", icon: "🧪" },
  { title: "Early pregnancy or PMS symptoms?", icon: "🤔" },
  { title: "Coping with pregnancy paranoia", icon: "🧘" },
];

const cycleArticles = [
  { title: "What counts as a late period?", readTime: "7 min read" },
  { title: "Cramps but no period? This could be why", readTime: "6 min read" },
  { title: "5 late period 'remedies' to avoid", readTime: "11 min read" },
];

export default function HomeScreen() {
  const { theme } = useThemeContext();
  return (
    <ScrollView style={styles(theme).container}>
      <CalendarHeader />
      <PeriodTrackerCard />

      {/* V2 Feature Entry Cards */}
      <SectionHeader title="Quick Access" />
      <FeatureEntryCard
        title="Petal Find"
        description="Find safe and clean washrooms near you"
        icon="map-marker"
        route="/features/map"
      />
      <FeatureEntryCard
        title="Doctor Connect"
        description="Book appointments with healthcare specialists"
        icon="user-md"
        route="/features/doctors"
      />
      <FeatureEntryCard
        title="Sister AI"
        description="Your caring Hinglish health assistant"
        icon="comments"
        comingSoon={true}
        gradientColors={[theme.colors.accent, theme.colors.primary]}
      />

      <SectionHeader title="My daily insights" />
      <FlatList
        horizontal
        data={insights}
        renderItem={({ item }) => (
          <InsightCard
            title={item.title}
            icon={<Text style={{ fontSize: 28 }}>{item.icon}</Text>}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
      />
      <ArticleCard
        title="Am I pregnant?"
        items={[
          "8 early signs of pregnancy",
          "Taking a pregnancy test",
          "Other reasons you're late",
        ]}
        image={require("../../assets/images/floral-background.png")}
      />
      <SectionHeader title="Based on your current cycle" />
      <FlatList
        horizontal
        data={cycleArticles}
        renderItem={({ item }) => (
          <View style={{ marginRight: theme.spacing.md, width: 250 }}>
            <ArticleCard
              title={item.title}
              image={require("../../assets/images/floral-background.png")}
              height={150}
            />
            <Text style={styles(theme).readTime}>{item.readTime}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
      />
      <CycleSummaryCard />
      <SymptomPatternsCard />
      <NotesCard />
      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as ViewStyle,
    readTime: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.lg,
    },
  });
