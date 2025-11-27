import { FontAwesome } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import washroomsData from "../../../assets/data/washrooms.json";
import { AppTheme, useThemeContext } from "../../components/ThemeContext";

// Check if running in Expo Go (native maps won't work)
const isExpoGo = Constants.appOwnership === "expo";

// Conditionally import MapView only if not in Expo Go
let MapView: React.ComponentType<unknown> | null = null;
let Marker: React.ComponentType<unknown> | null = null;
let PROVIDER_GOOGLE: string | null = null;

if (!isExpoGo) {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch {
    // Maps not available
  }
}

interface Washroom {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  rating: number;
  cleanliness: string;
  cost: string;
  amenities: string[];
  hours: string;
  verified: boolean;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Molarband Extension default location
const DEFAULT_REGION: Region = {
  latitude: 28.5009,
  longitude: 77.3077,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function PetalFindMap() {
  const { theme } = useThemeContext();
  const mapRef = useRef<unknown>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWashroom, setSelectedWashroom] = useState<Washroom | null>(
    null
  );
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  const washrooms: Washroom[] = washroomsData.washrooms;

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Location permission denied. Using default location.");
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      } catch {
        setErrorMsg("Could not get location. Using default.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMarkerPress = useCallback((washroom: Washroom) => {
    setSelectedWashroom(washroom);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const centerOnUser = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
  }, [location]);

  const getMarkerColor = (cleanliness: string): string => {
    switch (cleanliness) {
      case "Excellent":
        return theme.colors.success;
      case "Good":
        return theme.colors.primary;
      case "Average":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  if (isLoading) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(theme).loadingText}>
          Finding safe spaces near you...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles(theme).container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles(theme).map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {washrooms.map((washroom) => (
          <Marker
            key={washroom.id}
            coordinate={{
              latitude: washroom.latitude,
              longitude: washroom.longitude,
            }}
            title={washroom.name}
            description={`${washroom.cleanliness} • ${washroom.cost}`}
            pinColor={getMarkerColor(washroom.cleanliness)}
            onPress={() => handleMarkerPress(washroom)}
          />
        ))}
      </MapView>

      {/* Header Overlay */}
      <View style={styles(theme).headerOverlay}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles(theme).headerGradient}
        >
          <Pressable onPress={handleGoBack} style={styles(theme).backButton}>
            <FontAwesome
              name="arrow-left"
              size={20}
              color={theme.colors.textOnPrimary}
            />
          </Pressable>
          <Text style={styles(theme).headerTitle}>Petal Find</Text>
          <View style={styles(theme).headerSpacer} />
        </LinearGradient>
      </View>

      {/* My Location Button */}
      <Pressable style={styles(theme).locationButton} onPress={centerOnUser}>
        <FontAwesome
          name="location-arrow"
          size={20}
          color={theme.colors.primary}
        />
      </Pressable>

      {/* Error Message */}
      {errorMsg && (
        <View style={styles(theme).errorBanner}>
          <Text style={styles(theme).errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Bottom Sheet for Washroom Details */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles(theme).bottomSheetBackground}
        handleIndicatorStyle={styles(theme).bottomSheetHandle}
      >
        <BottomSheetView style={styles(theme).bottomSheetContent}>
          {selectedWashroom ? (
            <>
              <View style={styles(theme).washroomHeader}>
                <Text style={styles(theme).washroomName}>
                  {selectedWashroom.name}
                </Text>
                {selectedWashroom.verified && (
                  <FontAwesome
                    name="check-circle"
                    size={18}
                    color={theme.colors.success}
                  />
                )}
              </View>

              <View style={styles(theme).ratingRow}>
                <FontAwesome
                  name="star"
                  size={16}
                  color={theme.colors.warning}
                />
                <Text style={styles(theme).ratingText}>
                  {selectedWashroom.rating}
                </Text>
                <Text style={styles(theme).cleanlinessText}>
                  • {selectedWashroom.cleanliness}
                </Text>
              </View>

              <View style={styles(theme).infoRow}>
                <FontAwesome
                  name="clock-o"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles(theme).infoText}>
                  {selectedWashroom.hours}
                </Text>
              </View>

              <View style={styles(theme).infoRow}>
                <FontAwesome
                  name="rupee"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles(theme).infoText}>
                  {selectedWashroom.cost}
                </Text>
              </View>

              {selectedWashroom.amenities.length > 0 && (
                <View style={styles(theme).amenitiesContainer}>
                  <Text style={styles(theme).amenitiesTitle}>Amenities</Text>
                  <View style={styles(theme).amenitiesList}>
                    {selectedWashroom.amenities.map((amenity, index) => (
                      <View key={index} style={styles(theme).amenityChip}>
                        <Text style={styles(theme).amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            <Text style={styles(theme).placeholderText}>
              Tap a marker to see details
            </Text>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.body.family,
    },
    map: {
      flex: 1,
    },
    headerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    headerGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      backgroundColor: theme.organicCard.backgroundColor,
      borderRadius: theme.organicCard.borderRadius,
      elevation: theme.organicCard.elevation,
      shadowColor: theme.organicCard.shadowColor,
      shadowOffset: theme.organicCard.shadowOffset,
      shadowOpacity: theme.organicCard.shadowOpacity,
      shadowRadius: theme.organicCard.shadowRadius,
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
    locationButton: {
      position: "absolute",
      right: theme.spacing.lg,
      bottom: 180,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      elevation: theme.organicCard.elevation,
      shadowColor: theme.organicCard.shadowColor,
      shadowOffset: theme.organicCard.shadowOffset,
      shadowOpacity: theme.organicCard.shadowOpacity,
      shadowRadius: theme.organicCard.shadowRadius,
    },
    errorBanner: {
      position: "absolute",
      top: Platform.OS === "ios" ? 110 : 90,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: theme.colors.warningLight,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    errorText: {
      color: theme.colors.warning,
      fontSize: theme.typography.bodySmall.fontSize,
      textAlign: "center",
    },
    bottomSheetBackground: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xxl,
      borderTopRightRadius: theme.borderRadius.xxl,
    },
    bottomSheetHandle: {
      backgroundColor: theme.colors.border,
      width: 40,
    },
    bottomSheetContent: {
      padding: theme.spacing.lg,
    },
    washroomHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    washroomName: {
      flex: 1,
      fontSize: theme.typography.titleMedium.fontSize,
      fontFamily: theme.fonts.subtitle.family,
      fontWeight: "600",
      color: theme.colors.text,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    ratingText: {
      fontSize: theme.typography.bodyMedium.fontSize,
      fontWeight: "600",
      color: theme.colors.text,
    },
    cleanlinessText: {
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.textSecondary,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    infoText: {
      fontSize: theme.typography.bodyMedium.fontSize,
      color: theme.colors.textSecondary,
    },
    amenitiesContainer: {
      marginTop: theme.spacing.md,
    },
    amenitiesTitle: {
      fontSize: theme.typography.labelLarge.fontSize,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    amenitiesList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    amenityChip: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.round,
    },
    amenityText: {
      fontSize: theme.typography.labelSmall.fontSize,
      color: theme.colors.textSecondary,
    },
    placeholderText: {
      textAlign: "center",
      color: theme.colors.textMuted,
      fontSize: theme.typography.bodyMedium.fontSize,
    },
  });
