import React, { useEffect, useState, useCallback } from "react";
import { 
  Animated, 
  Platform, 
  StyleSheet, 
  View, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import LogPeriodModal from "../components/LogPeriodModal";
import { useThemeContext } from "../components/ThemeContext";
import { periodsAPI } from "../services/api";
import { useFocusEffect } from "expo-router";

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dots?: { key: string; color: string }[];
  customStyles?: any;
}

export default function CalendarScreen() {
  const { theme } = useThemeContext();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadPeriodData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load period history
      const historyResponse = await periodsAPI.getHistory(12, 0);
      const cycles = historyResponse.cycles || [];
      
      // Load predictions
      const predictionsResponse = await periodsAPI.getPredictions();
      setPredictions(predictionsResponse.predictions);
      
      // Load symptoms and moods for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const symptomsResponse = await periodsAPI.getSymptoms(
        threeMonthsAgo.toISOString().split('T')[0]
      );
      const symptoms = symptomsResponse.symptoms || [];
      
      const moodsResponse = await periodsAPI.getMoods(
        threeMonthsAgo.toISOString().split('T')[0]
      );
      const moods = moodsResponse.moods || [];
      
      // Create marked dates object
      const newMarkedDates: { [key: string]: MarkedDate } = {};
      
      // Mark period dates
      cycles.forEach((cycle: any) => {
        if (cycle.period_start_date) {
          const startDate = cycle.period_start_date;
          newMarkedDates[startDate] = {
            marked: true,
            selectedColor: theme.colors.error,
            customStyles: {
              container: {
                backgroundColor: theme.colors.error,
                borderRadius: 16,
              },
              text: {
                color: theme.colors.white,
                fontWeight: 'bold',
              },
            },
          };
          
          // Mark period duration if end date exists
          if (cycle.period_end_date) {
            const start = new Date(cycle.period_start_date);
            const end = new Date(cycle.period_end_date);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split('T')[0];
              newMarkedDates[dateStr] = {
                marked: true,
                selectedColor: theme.colors.error,
                customStyles: {
                  container: {
                    backgroundColor: theme.colors.errorLight,
                    borderRadius: 16,
                  },
                  text: {
                    color: theme.colors.text,
                    fontWeight: 'bold',
                  },
                },
              };
            }
          }
        }
      });
      
      // Mark predicted next period
      if (predictions?.next_period_date) {
        const predictedDate = predictions.next_period_date;
        newMarkedDates[predictedDate] = {
          ...newMarkedDates[predictedDate],
          marked: true,
          customStyles: {
            container: {
              backgroundColor: theme.colors.warning,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: theme.colors.primary,
            },
            text: {
              color: theme.colors.white,
              fontWeight: 'bold',
            },
          },
        };
      }
      
      // Mark fertile window
      if (predictions?.fertile_window) {
        const fertileStart = new Date(predictions.fertile_window.start);
        const fertileEnd = new Date(predictions.fertile_window.end);
        
        for (let d = new Date(fertileStart); d <= fertileEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!newMarkedDates[dateStr]) {
            newMarkedDates[dateStr] = {
              marked: true,
              customStyles: {
                container: {
                  backgroundColor: theme.colors.success,
                  borderRadius: 16,
                  opacity: 0.6,
                },
                text: {
                  color: theme.colors.white,
                },
              },
            };
          }
        }
      }
      
      // Mark symptom days
      symptoms.forEach((symptom: any) => {
        const dateStr = symptom.date;
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { marked: true };
        }
        newMarkedDates[dateStr].dots = [
          ...(newMarkedDates[dateStr].dots || []),
          { key: 'symptom', color: theme.colors.warning }
        ];
      });
      
      // Mark mood days
      moods.forEach((mood: any) => {
        const dateStr = mood.date;
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { marked: true };
        }
        newMarkedDates[dateStr].dots = [
          ...(newMarkedDates[dateStr].dots || []),
          { key: 'mood', color: theme.colors.info }
        ];
      });
      
      setMarkedDates(newMarkedDates);
    } catch (error: any) {
      console.error('Error loading period data:', error);
      Alert.alert('Error', 'Failed to load period data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [theme.colors, predictions]);

  // Fetch period data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPeriodData();
    }, [loadPeriodData])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPeriodData();
  };

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handlePeriodLogged = () => {
    // Refresh the calendar data
    loadPeriodData();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderBottomLeftRadius: theme.borderRadius.xl,
      borderBottomRightRadius: theme.borderRadius.xl,
      ...theme.shadows.md,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.brand,
      fontSize: 32,
      color: theme.colors.primary,
      textAlign: "center",
      flex: 1,
    },
    monthNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
    navButton: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.surfaceVariant,
      marginHorizontal: theme.spacing.lg,
    },
    monthText: {
      ...theme.typography.headlineMedium,
      color: theme.colors.text,
      fontWeight: '600',
      minWidth: 200,
      textAlign: 'center',
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    calendarContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      marginVertical: theme.spacing.lg,
      padding: theme.spacing.md,
      ...theme.shadows.lg,
    },
    legendContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      ...theme.shadows.md,
    },
    legendTitle: {
      ...theme.typography.titleMedium,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '48%',
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
    },
    legendIcon: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: theme.spacing.sm,
    },
    legendText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: '500',
      flex: 1,
    },
    insightsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      ...theme.shadows.md,
    },
    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    insightsTitle: {
      ...theme.typography.titleLarge,
      color: theme.colors.text,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
    insightCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    insightIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    insightContent: {
      flex: 1,
    },
    insightLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs / 2,
    },
    insightValue: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingContent: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.xl,
      ...theme.shadows.lg,
    },
    loadingText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      marginTop: theme.spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      margin: theme.spacing.lg,
      ...theme.shadows.md,
    },
    emptyStateIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyStateText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    emptyStateSubtext: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your cycle data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header with Navigation */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Period Calendar</Text>
        </View>
        
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {formatMonthYear(currentDate)}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Calendar */}
        <Animated.View style={[styles.calendarContainer, { opacity: fadeAnim }]}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            markingType={"multi-dot"}
            current={currentDate.toISOString().split('T')[0]}
            theme={{
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.white,
              todayTextColor: theme.colors.accent,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textMuted,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.primary,
              indicatorColor: theme.colors.primary,
              textMonthFontFamily: theme.fonts.subtitle.family,
              textMonthFontSize: 18,
              textMonthFontWeight: '600',
              textDayFontFamily: theme.fonts.body.family,
              textDayFontSize: 16,
              textDayHeaderFontFamily: theme.fonts.body.family,
              textDayHeaderFontSize: 13,
              textDayHeaderFontWeight: '500',
            }}
          />
        </Animated.View>

        {/* Modern Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Calendar Legend</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.legendText}>Period Days</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.legendText}>Predicted</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.legendText}>Fertile Window</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: theme.colors.info }]} />
              <Text style={styles.legendText}>Symptoms/Mood</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Cycle Insights */}
        {predictions ? (
          <View style={styles.insightsContainer}>
            <View style={styles.insightsHeader}>
              <Ionicons 
                name="analytics" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.insightsTitle}>Cycle Insights</Text>
            </View>
            
            <View style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={theme.colors.white} 
                />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Next Period Predicted</Text>
                <Text style={styles.insightValue}>
                  {new Date(predictions.next_period_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons 
                  name="refresh" 
                  size={20} 
                  color={theme.colors.white} 
                />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Average Cycle Length</Text>
                <Text style={styles.insightValue}>
                  {predictions.avg_cycle_length} days
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons 
                  name="time" 
                  size={20} 
                  color={theme.colors.white} 
                />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Average Period Length</Text>
                <Text style={styles.insightValue}>
                  {predictions.avg_period_length} days
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons 
                  name="flower" 
                  size={20} 
                  color={theme.colors.white} 
                />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Fertile Window</Text>
                <Text style={styles.insightValue}>
                  {new Date(predictions.fertile_window.start).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} - {new Date(predictions.fertile_window.end).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name="information-circle-outline" 
              size={48} 
              color={theme.colors.textMuted} 
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateText}>
              Track your period to see insights
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Tap on any date to log your period and get personalized predictions
            </Text>
          </View>
        )}
      </ScrollView>

      <LogPeriodModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        onPeriodLogged={handlePeriodLogged}
      />
    </View>
  );
}