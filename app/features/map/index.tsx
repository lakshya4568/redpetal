import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppTheme, useThemeContext } from "../../components/ThemeContext";

// Import washroom data
import washroomsData from "../../../assets/data/washrooms.json";

// Type definitions matching the JSON data
interface WashroomData {
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

interface Washroom extends WashroomData {
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Conditionally import MapView components (only in dev builds)
let MapView: React.ComponentType<unknown> | null = null;
let Marker: React.ComponentType<unknown> | null = null;
let PROVIDER_GOOGLE: string | null = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch {
    console.log("react-native-maps not available");
  }
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get icon for washroom type
const getWashroomIcon = (type: string): string => {
  switch (type) {
    case "mall":
      return "shopping-bag";
    case "restaurant":
      return "utensils";
    case "hospital":
      return "hospital";
    case "metro":
      return "subway";
    case "semi-public":
      return "building";
    default:
      return "restroom";
  }
};

// Get color for washroom type
const getWashroomColor = (type: string): string => {
  switch (type) {
    case "mall":
      return "#9C27B0";
    case "restaurant":
      return "#FF9800";
    case "hospital":
      return "#F44336";
    case "metro":
      return "#2196F3";
    case "semi-public":
      return "#607D8B";
    default:
      return "#4CAF50";
  }
};

// Check if washroom is free
const isFree = (cost: string): boolean => {
  return cost.toLowerCase() === "free";
};

// Check if washroom is accessible
const isAccessible = (amenities: string[]): boolean => {
  return amenities.some((a) => a.toLowerCase().includes("accessible"));
};

export default function PetalFindScreen() {
  const { theme } = useThemeContext();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [selectedWashroom, setSelectedWashroom] = useState<Washroom | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Load and sort washrooms by distance
  const loadWashrooms = useCallback((userLat: number, userLon: number) => {
    const washroomsWithDistance: Washroom[] = washroomsData.washrooms.map(
      (washroom: WashroomData) => ({
        ...washroom,
        distance: calculateDistance(
          userLat,
          userLon,
          washroom.latitude,
          washroom.longitude
        ),
      })
    );

    // Sort by distance
    washroomsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setWashrooms(washroomsWithDistance);
    setLoading(false);
  }, []);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          // Use default location (Molarband, Delhi)
          setUserLocation({ latitude: 28.5089, longitude: 77.2958 });
          loadWashrooms(28.5089, 77.2958);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        loadWashrooms(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError("Could not get your location");
        // Use default location
        setUserLocation({ latitude: 28.5089, longitude: 77.2958 });
        loadWashrooms(28.5089, 77.2958);
      }
    })();
  }, [loadWashrooms]);

  // Filter washrooms based on selected filter
  const filteredWashrooms = useMemo(() => {
    if (selectedFilter === "all") return washrooms;
    if (selectedFilter === "free")
      return washrooms.filter((w) => isFree(w.cost));
    if (selectedFilter === "accessible")
      return washrooms.filter((w) => isAccessible(w.amenities));
    return washrooms.filter((w) => w.type === selectedFilter);
  }, [washrooms, selectedFilter]);

  // Open directions in maps app
  const openDirections = useCallback((washroom: Washroom) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${washroom.latitude},${washroom.longitude}`;
    const label = washroom.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  }, []);

  // Render filter chip
  const renderFilterChip = (filter: string, label: string, icon: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterChip,
        selectedFilter === filter && styles.filterChipActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <FontAwesome5
        name={icon}
        size={12}
        color={selectedFilter === filter ? "#FFF" : theme.colors.text}
      />
      <Text
        style={[
          styles.filterChipText,
          selectedFilter === filter && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render washroom card for list view
  const renderWashroomCard = ({ item }: { item: Washroom }) => (
    <TouchableOpacity
      style={styles.washroomCard}
      onPress={() => setSelectedWashroom(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.typeIconContainer,
            { backgroundColor: getWashroomColor(item.type) + "20" },
          ]}
        >
          <FontAwesome5
            name={getWashroomIcon(item.type)}
            size={20}
            color={getWashroomColor(item.type)}
          />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.washroomName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.washroomType} numberOfLines={1}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} •{" "}
            {item.cleanliness}
          </Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
            {item.distance ? `${item.distance.toFixed(1)} km` : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.badgesRow}>
          {isFree(item.cost) && (
            <View style={[styles.badge, styles.freeBadge]}>
              <Text style={styles.badgeText}>Free</Text>
            </View>
          )}
          {!isFree(item.cost) && (
            <View style={[styles.badge, styles.paidBadge]}>
              <Text style={styles.badgeText}>{item.cost}</Text>
            </View>
          )}
          {isAccessible(item.amenities) && (
            <View style={[styles.badge, styles.accessibleBadge]}>
              <MaterialIcons name="accessible" size={12} color="#FFF" />
              <Text style={styles.badgeText}>Accessible</Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.hoursRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={theme.colors.textMuted}
          />
          <Text style={styles.hoursText}>{item.hours}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.directionsButton}
        onPress={() => openDirections(item)}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.directionsButtonGradient}
        >
          <MaterialIcons name="directions" size={18} color="#FFF" />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render detailed bottom sheet content
  const renderDetailSheet = () => {
    if (!selectedWashroom) return null;

    return (
      <View style={styles.detailSheet}>
        <TouchableOpacity
          style={styles.detailSheetHandle}
          onPress={() => setSelectedWashroom(null)}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <View
              style={[
                styles.detailTypeIcon,
                { backgroundColor: getWashroomColor(selectedWashroom.type) },
              ]}
            >
              <FontAwesome5
                name={getWashroomIcon(selectedWashroom.type)}
                size={24}
                color="#FFF"
              />
            </View>
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailName}>{selectedWashroom.name}</Text>
              <Text style={styles.detailType}>
                {selectedWashroom.type.charAt(0).toUpperCase() +
                  selectedWashroom.type.slice(1)}{" "}
                • {selectedWashroom.cleanliness}
              </Text>
            </View>
          </View>

          <View style={styles.detailInfoRow}>
            <View style={styles.detailInfoItem}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.detailInfoText}>
                {selectedWashroom.rating.toFixed(1)} Rating
              </Text>
            </View>
            <View style={styles.detailInfoItem}>
              <MaterialIcons
                name="directions-walk"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.detailInfoText}>
                {selectedWashroom.distance?.toFixed(2)} km away
              </Text>
            </View>
            <View style={styles.detailInfoItem}>
              <MaterialIcons
                name="attach-money"
                size={20}
                color={isFree(selectedWashroom.cost) ? "#4CAF50" : "#FF9800"}
              />
              <Text style={styles.detailInfoText}>{selectedWashroom.cost}</Text>
            </View>
          </View>

          <View style={styles.amenitiesSection}>
            <Text style={styles.amenitiesTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {selectedWashroom.amenities.length > 0 ? (
                selectedWashroom.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noAmenitiesText}>No amenities listed</Text>
              )}
            </View>
          </View>

          <View style={styles.hoursSection}>
            <Ionicons
              name="time-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.hoursSectionText}>
              Open: {selectedWashroom.hours}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.largeDirectionsButton}
            onPress={() => openDirections(selectedWashroom)}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.largeDirectionsButtonGradient}
            >
              <MaterialIcons name="directions" size={24} color="#FFF" />
              <Text style={styles.largeDirectionsButtonText}>
                Navigate to Washroom
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render map view (only in development builds)
  const renderMapView = () => {
    if (!MapView || !Marker || !userLocation) return null;

    const MapComponent = MapView as React.ComponentType<{
      style: object;
      provider: string | null;
      initialRegion: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      };
      showsUserLocation: boolean;
      showsMyLocationButton: boolean;
      children: React.ReactNode;
    }>;

    const MarkerComponent = Marker as React.ComponentType<{
      key: string;
      coordinate: { latitude: number; longitude: number };
      title: string;
      description: string;
      onPress: () => void;
      children?: React.ReactNode;
    }>;

    return (
      <MapComponent
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredWashrooms.map((washroom) => (
          <MarkerComponent
            key={washroom.id}
            coordinate={{
              latitude: washroom.latitude,
              longitude: washroom.longitude,
            }}
            title={washroom.name}
            description={`${washroom.distance?.toFixed(2)} km • ${
              washroom.rating
            }⭐`}
            onPress={() => setSelectedWashroom(washroom)}
          >
            <View
              style={[
                styles.customMarker,
                { backgroundColor: getWashroomColor(washroom.type) },
              ]}
            >
              <FontAwesome5
                name={getWashroomIcon(washroom.type)}
                size={16}
                color="#FFF"
              />
            </View>
          </MarkerComponent>
        ))}
      </MapComponent>
    );
  };

  // Render Expo Go fallback banner
  const renderExpoGoBanner = () => (
    <View style={styles.expoGoBanner}>
      <LinearGradient
        colors={["#FF9A9E", "#FECFEF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.expoGoBannerGradient}
      >
        <Ionicons name="information-circle" size={20} color="#FFF" />
        <Text style={styles.expoGoBannerText}>
          Map view requires a development build. Showing list view.
        </Text>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Finding nearby washrooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌸 Petal Find</Text>
        <View style={styles.headerRight}>
          {locationError && (
            <Ionicons name="location-outline" size={24} color="#FFF" />
          )}
        </View>
      </LinearGradient>

      {/* Expo Go Banner */}
      {isExpoGo && renderExpoGoBanner()}

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { filter: "all", label: "All", icon: "list" },
            { filter: "free", label: "Free", icon: "hand-holding-usd" },
            { filter: "accessible", label: "Accessible", icon: "wheelchair" },
            { filter: "mall", label: "Malls", icon: "shopping-bag" },
            { filter: "public", label: "Public", icon: "restroom" },
          ]}
          renderItem={({ item }) =>
            renderFilterChip(item.filter, item.label, item.icon)
          }
          keyExtractor={(item) => item.filter}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Main Content */}
      {isExpoGo ? (
        // List view for Expo Go
        <FlatList
          data={filteredWashrooms}
          renderItem={renderWashroomCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="restroom"
                size={48}
                color={theme.colors.textMuted}
              />
              <Text style={styles.emptyText}>No washrooms found</Text>
            </View>
          }
        />
      ) : (
        // Map view for development builds
        <View style={styles.mapContainer}>{renderMapView()}</View>
      )}

      {/* Detail Sheet */}
      {selectedWashroom && renderDetailSheet()}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
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
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textMuted,
      fontFamily: "OpenSans-Regular",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: "Pacifico-Regular",
      color: "#FFF",
    },
    headerRight: {
      width: 40,
    },
    expoGoBanner: {
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 12,
      overflow: "hidden",
    },
    expoGoBannerGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 8,
    },
    expoGoBannerText: {
      flex: 1,
      color: "#FFF",
      fontSize: 13,
      fontFamily: "OpenSans-Regular",
    },
    filterContainer: {
      paddingVertical: 12,
    },
    filterList: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      marginRight: 8,
      gap: 6,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontFamily: "OpenSans-SemiBold",
      color: theme.colors.text,
    },
    filterChipTextActive: {
      color: "#FFF",
    },
    listContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    customMarker: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#FFF",
    },
    washroomCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    typeIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    cardHeaderText: {
      flex: 1,
      marginLeft: 12,
    },
    washroomName: {
      fontSize: 16,
      fontFamily: "OpenSans-Bold",
      color: theme.colors.text,
    },
    washroomType: {
      fontSize: 13,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    distanceBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    distanceText: {
      fontSize: 12,
      fontFamily: "OpenSans-SemiBold",
      color: theme.colors.primary,
    },
    cardBody: {
      marginBottom: 12,
    },
    badgesRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    freeBadge: {
      backgroundColor: "#4CAF50",
    },
    paidBadge: {
      backgroundColor: "#FF9800",
    },
    accessibleBadge: {
      backgroundColor: "#2196F3",
    },
    badgeText: {
      fontSize: 11,
      fontFamily: "OpenSans-SemiBold",
      color: "#FFF",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingText: {
      fontSize: 13,
      fontFamily: "OpenSans-SemiBold",
      color: theme.colors.text,
    },
    hoursRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    hoursText: {
      fontSize: 13,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.textMuted,
    },
    directionsButton: {
      borderRadius: 12,
      overflow: "hidden",
    },
    directionsButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 8,
    },
    directionsButtonText: {
      fontSize: 14,
      fontFamily: "OpenSans-SemiBold",
      color: "#FFF",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.textMuted,
    },
    // Detail Sheet Styles
    detailSheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 40,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    detailSheetHandle: {
      alignItems: "center",
      paddingVertical: 12,
    },
    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textMuted,
    },
    detailContent: {
      padding: 20,
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    detailTypeIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
    },
    detailHeaderText: {
      flex: 1,
      marginLeft: 16,
    },
    detailName: {
      fontSize: 20,
      fontFamily: "OpenSans-Bold",
      color: theme.colors.text,
    },
    detailType: {
      fontSize: 14,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    detailInfoRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
    },
    detailInfoItem: {
      alignItems: "center",
      gap: 6,
    },
    detailInfoText: {
      fontSize: 14,
      fontFamily: "OpenSans-SemiBold",
      color: theme.colors.text,
    },
    amenitiesSection: {
      marginBottom: 16,
    },
    amenitiesTitle: {
      fontSize: 16,
      fontFamily: "OpenSans-Bold",
      color: theme.colors.text,
      marginBottom: 12,
    },
    amenitiesList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    amenityChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + "20",
    },
    amenityText: {
      fontSize: 13,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.primary,
    },
    noAmenitiesText: {
      fontSize: 13,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.textMuted,
      fontStyle: "italic",
    },
    hoursSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    hoursSectionText: {
      fontSize: 14,
      fontFamily: "OpenSans-Regular",
      color: theme.colors.textSecondary,
    },
    largeDirectionsButton: {
      borderRadius: 16,
      overflow: "hidden",
    },
    largeDirectionsButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 10,
    },
    largeDirectionsButtonText: {
      fontSize: 16,
      fontFamily: "OpenSans-Bold",
      color: "#FFF",
    },
  });
