import { Platform } from "react-native";

// Theme Color Palettes
export const colorPalettes = {
  blushPink: {
    primary: "#F7CAC9", // Blush Pink - warm and friendly
    accent: "#F88379", // Deep Coral
    neutral: "#FFF8F0", // Soft Cream
    background: "#FFF8F0",
    surface: "#FFFFFF",
    surfaceVariant: "#FFEEE8",
    text: "#2D2D2D",
    textSecondary: "#6B6B6B",
    textMuted: "#9B9B9B",
    textOnPrimary: "#FFFFFF",
    border: "#F7CAC9",
    borderLight: "#F9E5E4",
    shadow: "#F7CAC9",
    overlay: "rgba(247, 202, 201, 0.1)",
    // V2 Gradient Colors
    gradientStart: "#FF9A9E",
    gradientEnd: "#FECFEF",
  },
  roseRed: {
    primary: "#E63946", // Rose Red - feminine and modern
    accent: "#CDB4DB", // Soft Lavender
    neutral: "#F7F7F7", // Cool Gray
    background: "#F7F7F7",
    surface: "#FFFFFF",
    surfaceVariant: "#FCF3F4",
    text: "#2D2D2D",
    textSecondary: "#6B6B6B",
    textMuted: "#9B9B9B",
    textOnPrimary: "#FFFFFF",
    border: "#E63946",
    borderLight: "#F5C2C7",
    shadow: "#E63946",
    overlay: "rgba(230, 57, 70, 0.1)",
    // V2 Gradient Colors
    gradientStart: "#E63946",
    gradientEnd: "#F5C2C7",
  },
  terracotta: {
    primary: "#E06E5A", // Terracotta - natural and earthy
    accent: "#A8D5BA", // Sage Green
    neutral: "#FAF3DD", // Warm Beige
    background: "#FAF3DD",
    surface: "#FFFFFF",
    surfaceVariant: "#F5EDD1",
    text: "#2D2D2D",
    textSecondary: "#6B6B6B",
    textMuted: "#9B9B9B",
    textOnPrimary: "#FFFFFF",
    border: "#E06E5A",
    borderLight: "#F0C3B7",
    shadow: "#E06E5A",
    overlay: "rgba(224, 110, 90, 0.1)",
    // V2 Gradient Colors
    gradientStart: "#E06E5A",
    gradientEnd: "#F0C3B7",
  },
  dustyMauve: {
    primary: "#D8A7B1", // Dusty Mauve - soothing and mature
    accent: "#85586F", // Plum
    neutral: "#FEF9F8", // Light Ivory
    background: "#FEF9F8",
    surface: "#FFFFFF",
    surfaceVariant: "#F8F0EF",
    text: "#2D2D2D",
    textSecondary: "#6B6B6B",
    textMuted: "#9B9B9B",
    textOnPrimary: "#FFFFFF",
    border: "#D8A7B1",
    borderLight: "#E8CDD3",
    shadow: "#D8A7B1",
    overlay: "rgba(216, 167, 177, 0.1)",
    // V2 Gradient Colors
    gradientStart: "#D8A7B1",
    gradientEnd: "#E8CDD3",
  },
};

// Font Configuration with robust fallbacks
export const fonts = {
  // Title/Logo fonts - Pacifico (casual script) with system fallbacks
  title: {
    family: Platform.select({
      ios: "Pacifico-Title",
      android: "Pacifico-Title",
      web: "Pacifico, cursive",
      default: "Pacifico-Title",
    }),
    fallback: Platform.select({
      ios: "Georgia, serif",
      android: "serif",
      web: "Georgia, Times, serif",
      default: "serif",
    }),
  },
  // Subtitle fonts - Cookie (decorative script) with system fallbacks
  subtitle: {
    family: Platform.select({
      ios: "Cookie-subtitle",
      android: "Cookie-subtitle",
      web: "Cookie, cursive",
      default: "Cookie-subtitle",
    }),
    fallback: Platform.select({
      ios: "SF Pro Display, -apple-system, sans-serif",
      android: "Roboto, sans-serif",
      web: "system-ui, -apple-system, sans-serif",
      default: "sans-serif",
    }),
  },
  // Body text fonts - OpenSans with system fallbacks
  body: {
    family: Platform.select({
      ios: "OpenSans-Body",
      android: "OpenSans-Body",
      web: "Open Sans, sans-serif",
      default: "OpenSans-Body",
    }),
    fallback: Platform.select({
      ios: "SF Pro Text, -apple-system, sans-serif",
      android: "Roboto, sans-serif",
      web: "system-ui, -apple-system, sans-serif",
      default: "sans-serif",
    }),
  },
  // Weight variants
  weights: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
  },
};

// Typography Scale with semantic naming
export const typography = {
  // App branding
  brand: {
    fontSize: 64,
    lineHeight: 72,
    fontFamily: fonts.title.family,
    fontWeight: fonts.weights.regular,
    letterSpacing: 0.5,
  },
  // Large display text
  displayLarge: {
    fontSize: 56,
    lineHeight: 64,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.bold,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.bold,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.semiBold,
    letterSpacing: 0,
  },
  // Headlines
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.semiBold,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.semiBold,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0,
  },
  // Titles
  titleLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fonts.subtitle.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0.1,
  },
  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.regular,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.regular,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.regular,
    letterSpacing: 0.4,
  },
  // Labels
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0.5,
  },
  // Interactive elements
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.medium,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.body.family,
    fontWeight: fonts.weights.regular,
    letterSpacing: 0.4,
  },
};

// Spacing System (8pt grid)
export const spacing = {
  none: 0,
  xs: 4, // 0.5 * base
  sm: 8, // 1 * base
  md: 16, // 2 * base
  lg: 24, // 3 * base
  xl: 32, // 4 * base
  xxl: 48, // 6 * base
  xxxl: 64, // 8 * base
  huge: 96, // 12 * base
};

// Border Radius Scale
export const borderRadius = {
  none: 0,
  xs: 1,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  round: 999, // For circular elements
};

// Shadow System
export const shadows = {
  none: {
    boxShadow: "none",
    elevation: 0,
  },
  xs: {
    boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  sm: {
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  md: {
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },
  lg: {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    elevation: 8,
  },
  xl: {
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.25)",
    elevation: 12,
  },
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
};

// V2: Reanimated 2 Spring Configurations (60fps optimized)
export const springConfigs = {
  snappy: {
    damping: 15,
    stiffness: 400,
    mass: 0.8,
  },
  smooth: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.7,
  },
  gentle: {
    damping: 25,
    stiffness: 120,
    mass: 1.2,
  },
};

// V2: Timing Configurations
export const timingConfigs = {
  fast: { duration: 150 },
  normal: { duration: 250 },
  slow: { duration: 400 },
};

// V2: Responsive Design Tokens (based on 375px design width)
export const responsiveTokens = {
  baseWidth: 375,
  baseHeight: 812,
  cardWidth: {
    small: 150,
    medium: 200,
    large: 280,
    full: "100%",
  },
  cardHeight: {
    small: 120,
    medium: 150,
    large: 200,
  },
  iconSize: {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 48,
  },
};

// V2: Glass Effect Styles (for expo-blur)
export const glassStyles = {
  light: {
    intensity: 50,
    tint: "light" as const,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  dark: {
    intensity: 80,
    tint: "dark" as const,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  prominent: {
    intensity: 100,
    tint: "prominent" as const,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
};

// V2: Card Style Constants (Organic Modernism)
export const organicCard = {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  elevation: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
};

// Current theme selection (change this to switch themes)
const currentPalette: keyof typeof colorPalettes = "blushPink";
const activeColorPalette = colorPalettes[currentPalette];

// Complete Theme Object
export const theme = {
  colors: {
    ...activeColorPalette,
    // Semantic colors
    success: "#4CAF50",
    successLight: "#C8E6C9",
    warning: "#FF9800",
    warningLight: "#FFE0B2",
    error: "#F44336",
    errorLight: "#FFCDD2",
    info: "#2196F3",
    infoLight: "#BBDEFB",
    // Absolute colors
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
  // V2: Gradient colors for expo-linear-gradient
  gradients: {
    primary: [
      activeColorPalette.gradientStart,
      activeColorPalette.gradientEnd,
    ] as [string, string],
    accent: [activeColorPalette.accent, activeColorPalette.primary] as [
      string,
      string
    ],
    surface: ["#FFFFFF", activeColorPalette.surfaceVariant] as [string, string],
  },
  // V2: Glass effect configuration
  glass: glassStyles,
  // V2: Organic card style
  organicCard,
  fonts,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  // Component-specific theme tokens
  components: {
    screen: {
      padding: spacing.lg,
      backgroundColor: activeColorPalette.background,
    },
    header: {
      backgroundColor: activeColorPalette.surface,
      borderBottomColor: activeColorPalette.borderLight,
      borderBottomWidth: 1,
      ...shadows.sm,
    },
    button: {
      primary: {
        backgroundColor: activeColorPalette.primary,
        color: activeColorPalette.textOnPrimary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...typography.button,
        ...shadows.sm,
      },
      secondary: {
        backgroundColor: "transparent",
        color: activeColorPalette.primary,
        borderColor: activeColorPalette.primary,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...typography.button,
      },
      ghost: {
        backgroundColor: "transparent",
        color: activeColorPalette.primary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...typography.button,
      },
    },
    input: {
      backgroundColor: activeColorPalette.surface,
      borderColor: activeColorPalette.border,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: activeColorPalette.text,
      ...typography.bodyLarge,
    },
    card: {
      backgroundColor: activeColorPalette.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.md,
    },
    tabBar: {
      backgroundColor: activeColorPalette.primary,
      borderRadius: borderRadius.xxl,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      paddingBottom: spacing.sm,
      ...shadows.lg,
    },
    modal: {
      backgroundColor: activeColorPalette.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      margin: spacing.lg,
      ...shadows.xl,
    },
    divider: {
      backgroundColor: activeColorPalette.borderLight,
      height: 1,
    },
  },
};

// Helper function to switch themes dynamically
export const switchTheme = (paletteName: keyof typeof colorPalettes) => {
  const newPalette = colorPalettes[paletteName];
  return {
    ...theme,
    colors: {
      ...newPalette,
      success: "#4CAF50",
      successLight: "#C8E6C9",
      warning: "#FF9800",
      warningLight: "#FFE0B2",
      error: "#F44336",
      errorLight: "#FFCDD2",
      info: "#2196F3",
      infoLight: "#BBDEFB",
      white: "#FFFFFF",
      black: "#000000",
      transparent: "transparent",
    },
    // V2: Dynamic gradient colors
    gradients: {
      primary: [newPalette.gradientStart, newPalette.gradientEnd] as [
        string,
        string
      ],
      accent: [newPalette.accent, newPalette.primary] as [string, string],
      surface: ["#FFFFFF", newPalette.surfaceVariant] as [string, string],
    },
    components: {
      ...theme.components,
      screen: {
        ...theme.components.screen,
        backgroundColor: newPalette.background,
      },
      button: {
        primary: {
          ...theme.components.button.primary,
          backgroundColor: newPalette.primary,
          color: newPalette.textOnPrimary,
        },
        secondary: {
          ...theme.components.button.secondary,
          color: newPalette.primary,
          borderColor: newPalette.primary,
        },
        ghost: {
          ...theme.components.button.ghost,
          color: newPalette.primary,
        },
      },
      input: {
        ...theme.components.input,
        backgroundColor: newPalette.surface,
        borderColor: newPalette.border,
        color: newPalette.text,
      },
      card: {
        ...theme.components.card,
        backgroundColor: newPalette.surface,
      },
      tabBar: {
        ...theme.components.tabBar,
        backgroundColor: newPalette.primary,
      },
      modal: {
        ...theme.components.modal,
        backgroundColor: newPalette.surface,
      },
      divider: {
        ...theme.components.divider,
        backgroundColor: newPalette.borderLight,
      },
    },
  };
};

// Export current theme as default
export default theme;
