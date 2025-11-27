# RedPetal V2 Upgrade Tasks

This file tracks the progress of the RedPetal V2 "Super App" upgrade as outlined in `repetal.prompt.md`.

**Start Date:** November 27, 2025  
**Target:** Transform RedPetal into a Super App with Washroom Finder, Doctor Connect, and modern "Organic Modernism" UI.

---

## Progress Summary

| Phase | Task                  | Status  | Notes                                            |
| ----- | --------------------- | ------- | ------------------------------------------------ |
| 1     | Setup & Dependencies  | ✅ Done | Installed maps, location, bottom-sheet, gradient |
| 2     | Theme System Upgrade  | ✅ Done | Added gradients, glass effects, organic card     |
| 3     | Tab Bar Redesign      | ✅ Done | Custom floating glass tab bar with blur          |
| 4     | Petal Find (Map)      | ✅ Done | Washroom finder with Google Maps                 |
| 5     | Doctor Connect        | ✅ Done | Doctor cards with phone dialer                   |
| 6     | Sister AI Placeholder | ✅ Done | Coming Soon card on home screen                  |

---

## Detailed Tasks

### Phase 1: Setup & Dependencies

- [x] Install `react-native-maps`
- [x] Install `expo-location`
- [x] Install `@gorhom/bottom-sheet`
- [x] Install `expo-linear-gradient`
- [x] Create `.env` with `GOOGLE_MAPS_API_KEY`
- [x] Update `app.json` with Google Maps config plugin

### Phase 2: Theme System Upgrade

- [x] Add `gradients` object to each color palette in `theme.ts`
- [x] Add `glassStyle` helper to theme
- [x] Update `ThemeContext.tsx` with proper TypeScript types (remove `any`)

### Phase 3: Tab Bar Redesign

- [x] Create custom `FloatingTabBar` component
- [x] Use `expo-blur` for glass effect
- [x] Use `expo-linear-gradient` for gradient background
- [x] Float 20px from bottom edge
- [x] Maintain 5 tabs: Home, Calendar, Community, Remedies, Profile

### Phase 4: Petal Find (Washroom Finder)

- [x] Create `app/features/map/index.tsx`
- [x] Implement `expo-location` for real user location
- [x] Add `MapView` with `PROVIDER_GOOGLE`
- [x] Create mock washroom data for Molarband Extension
- [x] Implement `@gorhom/bottom-sheet` for washroom details
- [x] Add custom map markers
- [x] Add entry point card on Home screen

### Phase 5: Doctor Connect

- [x] Create `assets/data/doctors.json` with mock data
- [x] Create `app/features/doctors/index.tsx`
- [x] Implement vertical card list
- [x] Add phone dialer via `Linking.openURL('tel:...')`
- [x] Add entry point card on Home screen

### Phase 6: Sister AI (Deferred to V3)

- [x] Add "Coming Soon" placeholder card on Home screen
- [ ] Reserve space for future chat feature background image (V3)

---

## Completed Tasks Log

### November 27, 2025 - V2 Initial Implementation Complete

**Summary:** Completed full V2 upgrade including:

- Installed all dependencies (react-native-maps, expo-location, @gorhom/bottom-sheet, expo-linear-gradient)
- Upgraded theme system with gradients, glass effects, and organic card styles
- Created custom FloatingTabBar component with blur effect
- Implemented Petal Find (Washroom Finder) with Google Maps integration
- Implemented Doctor Connect with phone dialer
- Added Coming Soon placeholder for Sister AI
- Created FeatureEntryCard component for home screen navigation
- Updated app.json with Google Maps config and location permissions

**Files Created:**

- `app/components/FloatingTabBar.tsx`
- `app/components/FeatureEntryCard.tsx`
- `app/features/_layout.tsx`
- `app/features/map/index.tsx`
- `app/features/doctors/index.tsx`
- `assets/data/washrooms.json`
- `assets/data/doctors.json`

**Files Modified:**

- `app/theme.ts` - Added gradients, glassStyles, organicCard
- `app/components/ThemeContext.tsx` - Proper TypeScript typing
- `app/(tabs)/_layout.tsx` - New FloatingTabBar
- `app/(tabs)/index.tsx` - Feature entry cards
- `.env` - GOOGLE_MAPS_API_KEY
- `app.json` - Maps config, location permissions
- `.github/copilot-instructions.md` - V2 tracking reference

---

## Notes

- **Privacy Rule:** Health data stays in AsyncStorage only
- **Navigation:** Using expo-router exclusively
- **Styling:** No inline styles, use StyleSheet.create
- **Language Tone:** Use "Cycles", "Moon Time", "Body Signals" instead of clinical terms
- **Mobile First:** Prioritizing Android development

---

## Next Session Checklist

When resuming work:

1. Check this file for current status
2. Read `copilot-instructions.md` for context
3. Run `pnpm install` if dependencies were added
4. Continue from the next pending task
