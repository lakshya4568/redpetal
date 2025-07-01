# Font Setup Guide for RedPetal

## Current Font Status

### ✅ Working Fonts

- **Pacifico**: Available in `assets/fonts/Pacifico-Title.ttf` - Used for branding/titles
- **Cookie**: Available in `assets/fonts/Cookie-subtitle.ttf` - Used for decorative subtitles
- **Open Sans**: Available in `assets/fonts/OpenSans-Body.ttf` - Used for body text
- **System Fonts**: iOS (SF Pro), Android (Roboto), Web (system-ui)

### 🎯 Font Usage in App

- **Brand/Logo**: Pacifico (casual script font) ✅
- **Decorative Text**: Cookie (elegant script) ✅
- **Body Text**: Open Sans (clean and readable) ✅
- **Fallbacks**: System fonts for reliability ✅

## Current Theme Implementation

The theme is now set up to use:

1. **Brand/Logo**: Pacifico-Title (casual script) ✅
2. **Subtitles**: Cookie-subtitle (decorative script) ✅
3. **Body Text**: OpenSans-Body (clean sans-serif) ✅
4. **Fallbacks**: System fonts (SF Pro on iOS, Roboto on Android) ✅

## Font Loading Implementation

### FontProvider Component

The FontProvider component loads your actual fonts with improved error handling:

```tsx
// In FontProvider.tsx
const fontConfig = useMemo((): Record<string, any> => {
  // For web, don't load custom fonts
  if (Platform.OS === "web") {
    return {};
  }

  // For native platforms, load fonts with error handling
  try {
    const config: Record<string, any> = {
      "Pacifico-Title": require("../../assets/fonts/Pacifico-Title.ttf"),
      "Cookie-subtitle": require("../../assets/fonts/Cookie-subtitle.ttf"),
      "OpenSans-Body": require("../../assets/fonts/OpenSans-Body.ttf"),
    };
    return config;
  } catch (error) {
    console.warn("Font files not found, using system fonts:", error);
    return {};
  }
}, []);
```

### Theme Configuration

The theme.ts file has been optimized for better font loading:

```typescript
export const fonts = {
  title: {
    family: Platform.select({
      ios: "Pacifico-Title",
      android: "Pacifico-Title",
      web: "Pacifico, cursive",
      default: "Pacifico-Title",
    }),
  },
  subtitle: {
    family: Platform.select({
      ios: "Cookie-subtitle",
      android: "Cookie-subtitle",
      web: "Cookie, cursive",
      default: "Cookie-subtitle",
    }),
  },
  body: {
    family: Platform.select({
      ios: "OpenSans-Body",
      android: "OpenSans-Body",
      web: "Open Sans, sans-serif",
      default: "OpenSans-Body",
    }),
  },
};
```

## Current Assets Structure

```text
assets/fonts/
├── Pacifico-Title.ttf              ✅ (for branding/titles)
├── Cookie-subtitle.ttf             ✅ (for decorative text)
├── OpenSans-Body.ttf               ✅ (for body text)
└── .DS_Store                       (system file)
```

## Error Resolution

### Common Font Loading Issues

The error you encountered (`ExpoFontLoader.loadAsync has been rejected`) can be caused by:

1. **Font file corruption**: The font files may be corrupted or incomplete
2. **Incorrect file format**: Ensure all font files are valid TTF/OTF formats
3. **Cache issues**: Font cache may need to be cleared
4. **Platform-specific issues**: Android font loading can be more sensitive

### 🔧 Solutions Applied

1. **Improved Error Handling**: FontProvider now has better error catching
2. **Reduced Timeout**: Changed from 5 seconds to 3 seconds to fail faster
3. **Clean Font Names**: Removed font stacks from family names for cleaner loading
4. **Better Fallbacks**: Improved fallback font configuration
5. **TypeScript Fixes**: Fixed type issues that could cause loading problems

### If Fonts Still Don't Load

If you continue to experience issues:

```bash
# Clear Expo cache
npx expo start --clear

# Or restart with tunnel
npx expo start --tunnel --clear

# Reset Metro bundler cache
npx react-native start --reset-cache
```

### Manual Font Verification

You can verify your font files are valid:

1. Open each font file on your computer to ensure they display correctly
2. Check file sizes - corrupted fonts are often 0 bytes or very small
3. Try opening the fonts in a font viewer application

If any fonts are corrupted, re-download them from:

- **Pacifico**: [Google Fonts](https://fonts.google.com/specimen/Pacifico)
- **Cookie**: [Google Fonts](https://fonts.google.com/specimen/Cookie)
- **Open Sans**: [Google Fonts](https://fonts.google.com/specimen/Open+Sans)

## How to Add More Fonts Later

### Step 1: Add Font Files

Place new TTF/OTF files in `/assets/fonts/`:

### Step 2: Update FontProvider

Add new fonts to the fontConfig in FontProvider.tsx:

```tsx
config["NewFont-Regular"] = require("../../assets/fonts/NewFont-Regular.ttf");
```

### Step 3: Update Theme

Add new font families to the fonts object in theme.ts:

```typescript
newFont: {
  family: Platform.select({
    ios: "NewFont-Regular, fallback",
    android: "NewFont-Regular, fallback",
    web: "New Font, fallback",
    default: "NewFont-Regular, fallback",
  }),
},
```

├── Poppins-Medium.ttf (to add)
├── Poppins-SemiBold.ttf (to add)
└── Poppins-Bold.ttf (to add)

````

### Step 3: Update FontProvider

```tsx
const [fontsLoaded] = useFonts({
  "GreatVibes-Regular": require("../../assets/fonts/GreatVibes-Regular.ttf"),
  "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),

  // Josefin Sans family
  "JosefinSans-Regular": require("../../assets/fonts/JosefinSans-Regular.ttf"),
  "JosefinSans-Medium": require("../../assets/fonts/JosefinSans-Medium.ttf"),
  "JosefinSans-SemiBold": require("../../assets/fonts/JosefinSans-SemiBold.ttf"),
  "JosefinSans-Bold": require("../../assets/fonts/JosefinSans-Bold.ttf"),

  // Poppins family
  "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
  "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
  "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
});
````

### Step 4: Update Theme Fonts

```tsx
export const fonts = {
  title: {
    family: Platform.select({
      ios: "GreatVibes-Regular",
      android: "GreatVibes-Regular",
      web: "Great Vibes, cursive",
      default: "GreatVibes-Regular",
    }),
  },
  subtitle: {
    family: Platform.select({
      ios: "JosefinSans-Regular",
      android: "JosefinSans-Regular",
      web: "Josefin Sans, sans-serif",
      default: "JosefinSans-Regular",
    }),
  },
  body: {
    family: Platform.select({
      ios: "Poppins-Regular",
      android: "Poppins-Regular",
      web: "Poppins, sans-serif",
      default: "Poppins-Regular",
    }),
  },
};
```

## Font Weight Mapping

When custom fonts are added, update the typography weights:

```tsx
// For Josefin Sans headings
headlineLarge: {
  fontFamily: 'JosefinSans-Bold',      // 700
},
headlineMedium: {
  fontFamily: 'JosefinSans-SemiBold',  // 600
},
titleLarge: {
  fontFamily: 'JosefinSans-Medium',    // 500
},

// For Poppins body text
bodyLarge: {
  fontFamily: 'Poppins-Regular',       // 400
},
button: {
  fontFamily: 'Poppins-Medium',        // 500
},
```

## Font Sources

### Free Font Sources

- **Google Fonts**: <https://fonts.google.com/>
- **Font Squirrel**: <https://www.fontsquirrel.com/>
- **Adobe Fonts**: <https://fonts.adobe.com/> (subscription)

### Direct Download Links

- **Josefin Sans**: <https://fonts.google.com/specimen/Josefin+Sans>
- **Poppins**: <https://fonts.google.com/specimen/Poppins>
- **Great Vibes**: <https://fonts.google.com/specimen/Great+Vibes>

## Alternative System Font Setup

If you prefer to stick with system fonts, here are some excellent options:

### iOS System Fonts

- **SF Pro Text**: Body text (already used)
- **SF Pro Display**: Large text/headings
- **New York**: Serif option for elegant text

### Android System Fonts

- **Roboto**: Primary sans-serif (already used)
- **Roboto Slab**: Serif option
- **Product Sans**: Google's brand font

### Web System Fonts

- **system-ui**: Uses the system's default UI font
- **-apple-system**: Apple's system font stack
- **Segoe UI**: Windows system font

## Current Implementation Benefits

✅ **Fast Loading**: No custom font downloads required  
✅ **Cross-Platform**: Works on iOS, Android, and Web  
✅ **Accessibility**: System fonts are optimized for readability  
✅ **Performance**: No additional bundle size  
✅ **Native Feel**: Uses platform-appropriate fonts

The current setup provides a solid foundation that can be enhanced with custom fonts later without breaking existing functionality.
