/**
 * CalendarHeader - Redesigned for RedPetal V2
 * Modern horizontal date picker with smooth 60fps animations
 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { responsive, springConfigs, timingConfigs } from "../utils/animations";
import { AppTheme, useThemeContext } from "./ThemeContext";

const DATE_ITEM_WIDTH = responsive.wp(12);
const DATE_ITEM_MARGIN = responsive.sp(6);
const TOTAL_DATE_WIDTH = DATE_ITEM_WIDTH + DATE_ITEM_MARGIN * 2;

interface DateItemProps {
  date: number;
  dayName: string;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
  theme: AppTheme;
  index: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(
  require("react-native").TouchableOpacity
);

const DateItem = React.memo(
  ({
    date,
    dayName,
    isToday,
    isSelected,
    onSelect,
    theme,
    index,
  }: DateItemProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    // Staggered entrance animation
    useEffect(() => {
      const delay = index * 30;
      const timeout = setTimeout(() => {
        opacity.value = withTiming(1, timingConfigs.normal);
        translateY.value = withSpring(0, springConfigs.gentle);
      }, delay);
      return () => clearTimeout(timeout);
    }, [index, opacity, translateY]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.92, springConfigs.snappy);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, springConfigs.snappy);
    }, [scale]);

    const containerStyle = useMemo(
      () => [
        styles(theme).dateItemContainer,
        isSelected && styles(theme).dateItemSelected,
        isToday && !isSelected && styles(theme).dateItemToday,
      ],
      [isSelected, isToday, theme]
    );

    return (
      <AnimatedTouchable
        style={[animatedContainerStyle, containerStyle]}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text
          style={[
            styles(theme).dayNameText,
            isSelected && styles(theme).selectedText,
          ]}
        >
          {dayName}
        </Text>
        <View
          style={[
            styles(theme).dateCircle,
            isSelected && styles(theme).dateCircleSelected,
            isToday && !isSelected && styles(theme).dateCircleToday,
          ]}
        >
          <Text
            style={[
              styles(theme).dateText,
              isSelected && styles(theme).selectedDateText,
              isToday && !isSelected && styles(theme).todayDateText,
            ]}
          >
            {date}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  }
);

DateItem.displayName = "DateItem";

export default function CalendarHeader() {
  const { theme } = useThemeContext();
  const flatListRef = useRef<FlatList>(null);
  const headerOpacity = useSharedValue(0);

  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();

  const [selectedDate, setSelectedDate] = React.useState(currentDate);

  // Generate dates array
  const dates = useMemo(() => {
    const daysInMonth = new Date(
      currentYear,
      currentMonthIndex + 1,
      0
    ).getDate();
    const dayNames = ["S", "S", "M", "T", "W", "T", "F"];

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1;
      const dayOfWeek = new Date(currentYear, currentMonthIndex, date).getDay();
      return {
        date,
        dayName: dayNames[dayOfWeek],
        isToday: date === currentDate,
      };
    });
  }, [currentYear, currentMonthIndex, currentDate]);

  // Animate header on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
  }, [headerOpacity]);

  // Scroll to today on mount
  useEffect(() => {
    const scrollToIndex = currentDate - 1;
    const timer = setTimeout(() => {
      if (flatListRef.current && scrollToIndex >= 0) {
        flatListRef.current.scrollToIndex({
          index: Math.max(0, scrollToIndex - 2),
          animated: true,
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentDate]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          headerOpacity.value,
          [0, 1],
          [-10, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const handleDateSelect = useCallback((date: number) => {
    setSelectedDate(date);
  }, []);

  const renderDateItem = useCallback(
    ({ item, index }: { item: (typeof dates)[0]; index: number }) => (
      <DateItem
        date={item.date}
        dayName={item.dayName}
        isToday={item.isToday}
        isSelected={selectedDate === item.date}
        onSelect={() => handleDateSelect(item.date)}
        theme={theme}
        index={index}
      />
    ),
    [selectedDate, theme, handleDateSelect]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: TOTAL_DATE_WIDTH,
      offset: TOTAL_DATE_WIDTH * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: (typeof dates)[0]) => item.date.toString(),
    []
  );

  return (
    <View style={styles(theme).container}>
      <Animated.View style={[styles(theme).headerRow, animatedHeaderStyle]}>
        <Text style={styles(theme).monthText}>
          {currentDate} {currentMonth}
        </Text>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles(theme).dateListContent}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
      />
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingTop:
        Platform.OS === "android" ? responsive.sp(40) : responsive.sp(50),
      paddingBottom: responsive.sp(16),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.borderLight,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: responsive.sp(20),
      marginBottom: responsive.sp(16),
    },
    monthText: {
      fontFamily: theme.fonts.title.family,
      fontSize: responsive.fs(24),
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    dateListContent: {
      paddingHorizontal: responsive.sp(12),
    },
    dateItemContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: DATE_ITEM_MARGIN,
      paddingVertical: responsive.sp(8),
      width: DATE_ITEM_WIDTH,
    },
    dateItemSelected: {
      backgroundColor: theme.colors.primary + "15",
      borderRadius: responsive.sp(16),
    },
    dateItemToday: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: responsive.sp(16),
    },
    dayNameText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(12),
      color: theme.colors.textMuted,
      marginBottom: responsive.sp(6),
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    selectedText: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    dateCircle: {
      width: responsive.sp(36),
      height: responsive.sp(36),
      borderRadius: responsive.sp(18),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    dateCircleSelected: {
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    dateCircleToday: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    dateText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    selectedDateText: {
      color: theme.colors.textOnPrimary,
      fontWeight: "700",
    },
    todayDateText: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
  });
