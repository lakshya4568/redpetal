# Font Setup Guide for RedPetal

## Current Font Status

### ✅ Working Fonts

- **Great Vibes**: Already available in `assets/fonts/GreatVibes-Regular.ttf`
- **SpaceMono**: Already available in `assets/fonts/SpaceMono-Regular.ttf`
- **System Fonts**: iOS (SF Pro), Android (Roboto), Web (system-ui)

### 🎯 Target Fonts (To Add Later)

- **Josefin Sans**: Modern geometric sans-serif for headings
- **Poppins**: Clean and readable sans-serif for body text

## Current Theme Implementation

The theme is now set up to use:

1. **Brand/Logo**: Great Vibes (elegant script) ✅
2. **Headings**: System fonts (Helvetica Neue on iOS, Roboto on Android) ✅
3. **Body Text**: System fonts (SF Pro Text on iOS, Roboto on Android) ✅

## How to Add Custom Fonts Later

### Step 1: Download Font Files

Download TTF/OTF files for:

- Josefin Sans (Regular, Medium, SemiBold, Bold)
- Poppins (Regular, Medium, SemiBold, Bold)

### Step 2: Add to Assets

Place font files in `/assets/fonts/`:

```
assets/fonts/
├── GreatVibes-Regular.ttf          ✅ (already added)
├── SpaceMono-Regular.ttf           ✅ (already added)
├── JosefinSans-Regular.ttf         (to add)
├── JosefinSans-Medium.ttf          (to add)
├── JosefinSans-SemiBold.ttf        (to add)
├── JosefinSans-Bold.ttf            (to add)
├── Poppins-Regular.ttf             (to add)
├── Poppins-Medium.ttf              (to add)
├── Poppins-SemiBold.ttf            (to add)
└── Poppins-Bold.ttf                (to add)
```

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
```

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
