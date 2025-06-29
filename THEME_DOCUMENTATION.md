# RedPetal Theme System Documentation

## Overview

A comprehensive design system for the RedPetal app featuring multiple color palettes, modern typography, and consistent spacing.

## 🎨 Color Palettes

### 1. Blush Pink (Default)

- **Primary**: #F7CAC9 (Blush Pink)
- **Accent**: #F88379 (Deep Coral)
- **Background**: #FFF8F0 (Soft Cream)
- **Mood**: Warm and friendly

### 2. Rose Red

- **Primary**: #E63946 (Rose Red)
- **Accent**: #CDB4DB (Soft Lavender)
- **Background**: #F7F7F7 (Cool Gray)
- **Mood**: Feminine and modern

### 3. Terracotta

- **Primary**: #E06E5A (Terracotta)
- **Accent**: #A8D5BA (Sage Green)
- **Background**: #FAF3DD (Warm Beige)
- **Mood**: Natural and earthy

### 4. Dusty Mauve

- **Primary**: #D8A7B1 (Dusty Mauve)
- **Accent**: #85586F (Plum)
- **Background**: #FEF9F8 (Light Ivory)
- **Mood**: Soothing and mature

## 📝 Typography System

### Fonts Used

- **Brand/Logo**: Great Vibes (elegant script)
- **Headings**: Josefin Sans (modern geometric)
- **Body Text**: Poppins (clean and readable)

### Typography Scale

- `brand`: 64px - App name and major branding
- `displayLarge`: 56px - Large display text
- `displayMedium`: 48px - Medium display text
- `displaySmall`: 40px - Small display text
- `headlineLarge`: 32px - Large headings
- `headlineMedium`: 28px - Medium headings
- `headlineSmall`: 24px - Small headings
- `titleLarge`: 20px - Large titles
- `titleMedium`: 18px - Medium titles
- `titleSmall`: 16px - Small titles
- `bodyLarge`: 16px - Large body text
- `bodyMedium`: 14px - Medium body text
- `bodySmall`: 12px - Small body text
- `button`: 16px - Button text
- `caption`: 12px - Caption text

## 📏 Spacing System (8pt Grid)

- `none`: 0
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px
- `xxxl`: 64px
- `huge`: 96px

## 🔄 Border Radius

- `none`: 0
- `xs`: 2px
- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `xxl`: 24px
- `xxxl`: 32px
- `round`: 999px (circular)

## 🌑 Shadow System

- `none`: No shadow
- `xs`: Very subtle shadow
- `sm`: Small shadow
- `md`: Medium shadow
- `lg`: Large shadow
- `xl`: Extra large shadow

## ⏱️ Animation Timing

- `fast`: 150ms
- `normal`: 300ms
- `slow`: 500ms
- `slower`: 750ms

## 🧩 Component Theme Tokens

### Buttons

```tsx
// Primary button
{
  backgroundColor: theme.colors.primary,
  color: theme.colors.textOnPrimary,
  borderRadius: theme.borderRadius.md,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.md,
  ...theme.shadows.sm,
}

// Secondary button
{
  backgroundColor: 'transparent',
  color: theme.colors.primary,
  borderColor: theme.colors.primary,
  borderWidth: 1,
  borderRadius: theme.borderRadius.md,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.md,
}
```

### Inputs

```tsx
{
  backgroundColor: theme.colors.surface,
  borderColor: theme.colors.border,
  borderWidth: 1,
  borderRadius: theme.borderRadius.md,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.md,
  color: theme.colors.text,
  ...theme.typography.bodyLarge,
}
```

### Cards

```tsx
{
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.lg,
  ...theme.shadows.md,
}
```

### Tab Bar

```tsx
{
  backgroundColor: theme.colors.primary,
  borderRadius: theme.borderRadius.xxl,
  marginHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
  paddingBottom: theme.spacing.sm,
  ...theme.shadows.lg,
}
```

## 🎛️ How to Use

### Basic Usage

```tsx
import { theme } from "../theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.headlineLarge,
    color: theme.colors.text,
  },
  button: {
    ...theme.components.button.primary,
  },
});
```

### Switching Themes

```tsx
import { switchTheme } from "../theme";

// Switch to Rose Red theme
const newTheme = switchTheme("roseRed");

// Use the new theme in your components
const styles = StyleSheet.create({
  container: {
    backgroundColor: newTheme.colors.background,
  },
});
```

### Typography Usage

```tsx
// Use predefined typography
<Text style={theme.typography.brand}>RedPetal</Text>
<Text style={theme.typography.headlineMedium}>Section Title</Text>
<Text style={theme.typography.bodyLarge}>Body content</Text>

// Customize with theme colors
<Text style={[theme.typography.headlineSmall, { color: theme.colors.primary }]}>
  Colored Headline
</Text>
```

### Spacing and Layout

```tsx
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg, // 24px
    margin: theme.spacing.md, // 16px
    gap: theme.spacing.sm, // 8px
  },
  card: {
    borderRadius: theme.borderRadius.lg, // 12px
    ...theme.shadows.md, // Medium shadow
  },
});
```

## 🔧 Customization

### Adding New Color Palette

```tsx
// In theme.ts, add to colorPalettes:
newPalette: {
  primary: '#YOUR_PRIMARY_COLOR',
  accent: '#YOUR_ACCENT_COLOR',
  neutral: '#YOUR_NEUTRAL_COLOR',
  background: '#YOUR_BACKGROUND_COLOR',
  // ... other color tokens
},
```

### Creating Custom Component Themes

```tsx
// Add to theme.components:
customCard: {
  backgroundColor: activeColorPalette.surface,
  borderRadius: borderRadius.xl,
  padding: spacing.xl,
  borderColor: activeColorPalette.primary,
  borderWidth: 2,
  ...shadows.lg,
},
```

## 📱 Platform Support

- **iOS**: Native font fallbacks
- **Android**: Custom font integration
- **Web**: Web font loading with fallbacks

## 🎯 Best Practices

1. **Always use theme tokens** instead of hardcoded values
2. **Use semantic color names** (primary, accent, text) instead of color names (pink, red)
3. **Follow the 8pt spacing grid** for consistent layouts
4. **Use typography scale** for consistent text hierarchy
5. **Test across all themes** to ensure compatibility
6. **Use component theme tokens** for common UI patterns

## 🔄 Migration from Old Theme

### Before (Old Theme)

```tsx
const styles = StyleSheet.create({
  title: {
    fontSize: 48,
    fontFamily: "GreatVibes-Regular",
    color: "#ff8fab",
  },
  container: {
    padding: 16,
    backgroundColor: "#fff5f8",
  },
});
```

### After (New Theme)

```tsx
const styles = StyleSheet.create({
  title: {
    ...theme.typography.brand,
    color: theme.colors.primary,
  },
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
});
```

This comprehensive theme system provides consistency, flexibility, and scalability for the RedPetal app while maintaining beautiful design across all screens and components.
