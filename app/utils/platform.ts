/**
 * Android-First Platform Utilities
 *
 * Cross-platform helpers that prioritize Android behavior.
 * Handle common Android-specific rendering quirks like:
 * - Elevation vs shadow differences
 * - Font rendering differences
 * - Touch feedback ripple
 * - Status bar handling
 * - Border radius clipping on Android
 * - Safe text rendering with fallback fonts
 */

import { Dimensions, Platform, PixelRatio, StatusBar, ViewStyle } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Android-safe card shadow/elevation styles.
 * On Android, only `elevation` produces shadows. On iOS, uses native shadows.
 */
export function cardShadow(level: "sm" | "md" | "lg" | "xl" = "md"): ViewStyle {
  const elevationMap = { sm: 2, md: 4, lg: 8, xl: 12 };
  const shadowMap = {
    sm: { offset: 1, opacity: 0.06, radius: 4 },
    md: { offset: 2, opacity: 0.1, radius: 8 },
    lg: { offset: 4, opacity: 0.15, radius: 16 },
    xl: { offset: 8, opacity: 0.2, radius: 24 },
  };

  const shadow = shadowMap[level];
  return Platform.select({
    android: {
      elevation: elevationMap[level],
      // Android clips children to padding by default; ensure overflow visible
      // for elevation to work
    },
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: shadow.offset },
      shadowOpacity: shadow.opacity,
      shadowRadius: shadow.radius,
    },
    default: {},
  }) as ViewStyle;
}

/**
 * Android-safe borderRadius + overflow handling.
 * On older Android API levels, borderRadius + overflow:'hidden' can cause
 * rendering glitches. This ensures proper clipping.
 */
export function safeRoundedContainer(radius: number): ViewStyle {
  return Platform.select({
    android: {
      borderRadius: radius,
      overflow: "hidden" as const,
      // Android needs explicit overflow for borderRadius to clip children
    },
    ios: {
      borderRadius: radius,
    },
    default: {
      borderRadius: radius,
    },
  }) as ViewStyle;
}

/**
 * Get the correct status bar height for Android.
 * Much more reliable than hardcoded values.
 */
export function getStatusBarHeight(): number {
  if (Platform.OS === "android") {
    return StatusBar.currentHeight ?? 24;
  }
  // iOS handled by SafeAreaView
  return 0;
}

/**
 * Responsive font sizing that accounts for Android font scaling settings.
 * Prevents text from breaking layouts when users have large font settings.
 */
export function scaledFont(size: number, maxScale: number = 1.2): number {
  const fontScale = PixelRatio.getFontScale();
  const clampedScale = Math.min(fontScale, maxScale);
  const baseScale = SCREEN_WIDTH / 375; // Design width baseline
  return Math.round(size * baseScale * clampedScale);
}

/**
 * Responsive spacing that works consistently across Android DPI levels.
 */
export function scaledSpacing(size: number): number {
  return Math.round(size * (SCREEN_WIDTH / 375));
}

/**
 * Minimum touch target for Android (48dp recommended by Material Design).
 * Ensures all interactive elements are easily tappable.
 */
export function touchTarget(size: number = 48): ViewStyle {
  return {
    minWidth: size,
    minHeight: size,
  };
}

/**
 * Android-safe absolute positioning for floating elements.
 * Accounts for nav bar height and status bar.
 */
export function floatingPosition(options: {
  bottom?: number;
  top?: number;
  left?: number;
  right?: number;
}): ViewStyle {
  const androidNavBarHeight = Platform.OS === "android" ? 48 : 0;
  const bottomOffset = options.bottom
    ? options.bottom + androidNavBarHeight
    : undefined;

  return {
    position: "absolute",
    ...(bottomOffset !== undefined && { bottom: bottomOffset }),
    ...(options.top !== undefined && { top: options.top + getStatusBarHeight() }),
    ...(options.left !== undefined && { left: options.left }),
    ...(options.right !== undefined && { right: options.right }),
    zIndex: 999,
  };
}

/**
 * Safe text styling that handles Android font weight rendering.
 * Android has limited font weight support for some custom fonts.
 */
export function safeTextWeight(
  weight: "300" | "400" | "500" | "600" | "700" | "800"
): object {
  if (Platform.OS === "android") {
    // On Android, map fine-grained weights to supported levels
    const androidWeightMap: Record<string, string> = {
      "300": "300",
      "400": "normal",
      "500": "500",
      "600": "bold", // Android often treats 600 as bold
      "700": "bold",
      "800": "bold",
    };
    return { fontWeight: androidWeightMap[weight] as "normal" | "bold" | "300" | "500" };
  }
  return { fontWeight: weight };
}

/**
 * Prevent text from overflowing on Android by applying
 * proper ellipsis mode and ensuring text doesn't clip.
 */
export function safeTextOverflow(lines: number = 1): object {
  return {
    numberOfLines: lines,
    ellipsizeMode: "tail" as const,
    // Android-specific: prevents text getting cut off at baseline
    ...(Platform.OS === "android" && {
      includeFontPadding: false,
      textAlignVertical: "center" as const,
    }),
  };
}

/**
 * Android ripple configuration for Pressable components.
 * Returns undefined on iOS since it uses native highlight.
 */
export function androidRipple(color?: string): object | undefined {
  if (Platform.OS !== "android") return undefined;
  return {
    android_ripple: {
      color: color ?? "rgba(0, 0, 0, 0.08)",
      borderless: false,
    },
  };
}

/**
 * Screen-level safe padding that accounts for system UI on Android.
 */
export function screenPadding(): ViewStyle {
  return {
    paddingTop: Platform.OS === "android" ? getStatusBarHeight() + 8 : 0,
    paddingBottom: Platform.OS === "android" ? 16 : 0,
  };
}

export const androidConstants = {
  statusBarHeight: getStatusBarHeight(),
  navBarHeight: Platform.OS === "android" ? 48 : 0,
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
  minTouchTarget: 48,
  isAndroid: Platform.OS === "android",
};
