import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import doctorsData from "../../../assets/data/doctors.json";
import { AppTheme, useThemeContext } from "../../components/ThemeContext";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  distance: string;
  phone: string;
  rating: number;
  consultationFee: string;
  available: boolean;
  languages: string[];
  clinic: string;
}

export default function DoctorConnect() {
  const { theme } = useThemeContext();
  const doctors: Doctor[] = doctorsData.doctors;

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={styles(theme).card}>
      <View style={styles(theme).cardHeader}>
        <View style={styles(theme).avatarContainer}>
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles(theme).avatar}
          >
            <FontAwesome
              name="user-md"
              size={28}
              color={theme.colors.textOnPrimary}
            />
          </LinearGradient>
        </View>
        <View style={styles(theme).doctorInfo}>
          <View style={styles(theme).nameRow}>
            <Text style={styles(theme).doctorName}>{item.name}</Text>
            {item.available && (
              <View style={styles(theme).availableBadge}>
                <Text style={styles(theme).availableText}>Available</Text>
              </View>
            )}
          </View>
          <Text style={styles(theme).specialty}>{item.specialty}</Text>
          <Text style={styles(theme).qualification}>{item.qualification}</Text>
        </View>
      </View>

      <View style={styles(theme).detailsContainer}>
        <View style={styles(theme).detailRow}>
          <FontAwesome name="star" size={14} color={theme.colors.warning} />
          <Text style={styles(theme).detailText}>{item.rating}</Text>
          <Text style={styles(theme).detailSeparator}>•</Text>
          <FontAwesome
            name="briefcase"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles(theme).detailText}>{item.experience}</Text>
          <Text style={styles(theme).detailSeparator}>•</Text>
          <FontAwesome
            name="map-marker"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles(theme).detailText}>{item.distance}</Text>
        </View>

        <View style={styles(theme).clinicRow}>
          <FontAwesome
            name="hospital-o"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles(theme).clinicText}>{item.clinic}</Text>
        </View>

        <View style={styles(theme).languageRow}>
          <FontAwesome
            name="language"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles(theme).languageText}>
            {item.languages.join(", ")}
          </Text>
        </View>
      </View>

      <View style={styles(theme).cardFooter}>
        <Text style={styles(theme).feeText}>{item.consultationFee}</Text>
        <Pressable
          style={[
            styles(theme).bookButton,
            !item.available && styles(theme).bookButtonDisabled,
          ]}
          onPress={() => handleCall(item.phone)}
          disabled={!item.available}
        >
          <LinearGradient
            colors={
              item.available
                ? theme.gradients.primary
                : [theme.colors.textMuted, theme.colors.textMuted]
            }
            style={styles(theme).bookButtonGradient}
          >
            <FontAwesome
              name="phone"
              size={16}
              color={theme.colors.textOnPrimary}
            />
            <Text style={styles(theme).bookButtonText}>
              {item.available ? "Book Now" : "Unavailable"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles(theme).container}>
      {/* Header */}
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles(theme).header}
      >
        <Pressable onPress={handleGoBack} style={styles(theme).backButton}>
          <FontAwesome
            name="arrow-left"
            size={20}
            color={theme.colors.textOnPrimary}
          />
        </Pressable>
        <Text style={styles(theme).headerTitle}>Doctor Connect</Text>
        <View style={styles(theme).headerSpacer} />
      </LinearGradient>

      {/* Subtitle */}
      <View style={styles(theme).subtitleContainer}>
        <Text style={styles(theme).subtitle}>
          Find healthcare specialists near you
        </Text>
      </View>

      {/* Doctor List */}
      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles(theme).listContent}
        showsVerticalScrollIndicator={false}
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingTop: Platform.OS === "ios" ? 60 : 40,
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    headerTitle: {
      fontSize: theme.typography.titleLarge.fontSize,
      fontFamily: theme.fonts.subtitle.family,
      color: theme.colors.textOnPrimary,
      fontWeight: "600",
    },
    headerSpacer: {
      width: 36,
    },
    subtitleContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.body.family,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.organicCard.borderRadius,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...Platform.select({
        ios: {
          shadowColor: theme.organicCard.shadowColor,
          shadowOffset: theme.organicCard.shadowOffset,
          shadowOpacity: theme.organicCard.shadowOpacity,
          shadowRadius: theme.organicCard.shadowRadius,
        },
        android: {
          elevation: theme.organicCard.elevation,
        },
      }),
    },
    cardHeader: {
      flexDirection: "row",
      marginBottom: theme.spacing.md,
    },
    avatarContainer: {
      marginRight: theme.spacing.md,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    doctorInfo: {
      flex: 1,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    doctorName: {
      fontSize: theme.typography.titleMedium.fontSize,
      fontFamily: theme.fonts.subtitle.family,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    availableBadge: {
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.round,
    },
    availableText: {
      fontSize: theme.typography.labelSmall.fontSize,
      color: theme.colors.success,
      fontWeight: "600",
    },
    specialty: {
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.primary,
      fontWeight: "500",
      marginBottom: theme.spacing.xs / 2,
    },
    qualification: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textSecondary,
    },
    detailsContainer: {
      marginBottom: theme.spacing.md,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    detailText: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    detailSeparator: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.textMuted,
    },
    clinicRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    clinicText: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    languageRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    languageText: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      paddingTop: theme.spacing.md,
    },
    feeText: {
      fontSize: theme.typography.titleMedium.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
    },
    bookButton: {
      borderRadius: theme.borderRadius.md,
      overflow: "hidden",
    },
    bookButtonDisabled: {
      opacity: 0.6,
    },
    bookButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    bookButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.button.fontSize,
      fontWeight: "600",
    },
  });
