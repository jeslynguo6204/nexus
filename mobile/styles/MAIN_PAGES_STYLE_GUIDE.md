# Main Pages Style Guide

This guide defines the unified styling patterns for the 5 main tab pages:
- **Home/Discover** (`HomeScreen`)
- **Likes** (`LikesScreen`)
- **Friends** (`FriendsScreen`)
- **Chat/Matches** (`InboxScreen`)
- **Profile** (`ProfileScreen`)

All pages should follow these patterns for consistency.

---

## 1. Container & SafeAreaView

**Import:** `styles` from `ChatStyles.js`

```jsx
import styles from '../../../styles/ChatStyles';

<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
  {/* content */}
</SafeAreaView>
```

**Style:** `ChatStyles.container`
- `flex: 1`
- `backgroundColor: '#FFFFFF'`
- `paddingHorizontal: 16`

---

## 2. Top Bar Header

**Import:** `styles` from `ChatStyles.js`

**Structure:**
```jsx
<View style={styles.topBar}>
  {/* Left: Brand mark */}
  <Pressable style={styles.brandMark} hitSlop={10}>
    <Text style={styles.brandMarkText}>6°</Text>
  </Pressable>

  {/* Center: Page title */}
  <View style={styles.centerSlot}>
    <Text style={styles.title}>Page Title</Text>
  </View>

  {/* Right: Action button or spacer */}
  <ModeToggleButton ... /> {/* OR */}
  <View style={{ width: 60 }} /> {/* Spacer for pages without right action */}
</View>
```

**Styles:**
- `topBar`: `height: 50`, `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`, `marginTop: -6`
- `brandMark`: `width: 44`, `height: 44`, `borderRadius: 22`, `justifyContent: 'center'`
- `brandMarkText`: `color: '#111111'`, `fontSize: 26`, `fontWeight: '800'`, `letterSpacing: -0.5`
- `centerSlot`: `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`
- `title`: `color: '#111111'`, `fontSize: 22`, `fontWeight: '800'`, `letterSpacing: -0.2`
- `rightSlot`: `width: 44`, `height: 44` (if using a custom right action)

**Right slot options:**
- **ModeToggleButton** (for pages with romantic/platonic toggle): Home, Likes
- **Empty spacer** `<View style={{ width: 60 }} />` (for pages without right action): Friends, Profile
- **Custom action** (if needed): Use `styles.rightSlot` or custom width

---

## 3. Content Area

**Import:** `homeStyles` from `HomeStyles.js`

```jsx
import homeStyles from '../../../styles/HomeStyles';

<View style={homeStyles.content}>
  {/* page content */}
</View>
```

**Style:** `HomeStyles.content`
- `flex: 1`
- `paddingTop: 4`
- `paddingBottom: 0`

**Note:** The content area should NOT have its own background color. It inherits the white background from `ChatStyles.container`.

---

## 4. Empty States

**Import:** `homeStyles` from `HomeStyles.js`

**Structure:**
```jsx
<View style={homeStyles.emptyWrap}>
  <View style={homeStyles.emptyCard}>
    <Text style={homeStyles.emptyTitle}>Title Text</Text>
    <Text style={homeStyles.emptySub}>Subtitle text explaining the empty state.</Text>
  </View>
</View>
```

**Styles:**
- `emptyWrap`: `flex: 1`, `justifyContent: 'center'`, `alignItems: 'center'`, `paddingHorizontal: 24`
- `emptyCard`: `backgroundColor: COLORS.surface`, `borderRadius: 18`, `paddingVertical: 16`, `paddingHorizontal: 18`, `borderWidth: 1`, `borderColor: COLORS.divider`
- `emptyTitle`: `fontSize: 15`, `fontWeight: '800'`, `color: COLORS.textPrimary`, `textAlign: 'center'`, `lineHeight: 20`
- `emptySub`: `marginTop: 8`, `fontSize: 12`, `color: COLORS.textMuted`, `textAlign: 'center'`

**Loading states:**
```jsx
<View style={homeStyles.emptyWrap}>
  <ActivityIndicator size="large" color={COLORS.primary} />
</View>
```

---

## 5. Page-Specific Patterns

### Home/Discover
- Uses `ModeToggleButton` in right slot
- Content shows `SwipeDeck` or empty state
- Empty state may include action button (uses `ChatStyles.emptyStateButton`)

### Likes
- Uses `ModeToggleButton` in right slot
- Content shows grid of `MiniProfileCard` components (3 per row) or empty state
- Grid uses custom padding: `CARD_PADDING = 16`, `CARD_GAP = 12`

### Friends
- Uses empty spacer in right slot (no toggle needed)
- Content shows friend requests list or empty state
- List items have custom styling (not part of unified guide)

### Chat/Matches (InboxScreen)
- Uses `ModeToggleButton` in right slot
- Content shows list of chat rows (uses `ChatStyles.chatRow`, etc.)
- Empty state uses same pattern as above

### Profile
- Uses empty spacer in right slot
- Content is a `ScrollView` with profile sections
- Uses `ChatStyles` for top bar, but content is custom (profile-specific)

---

## 6. Color Tokens

**Import:** `COLORS` from `themeNEW.js`

Use these tokens consistently:
- `COLORS.background`: `'#FAFAFA'` (app canvas - not used in main pages, they use white)
- `COLORS.surface`: `'#FFFFFF'` (cards/modals)
- `COLORS.textPrimary`: `'#111111'` (headlines)
- `COLORS.textMuted`: `'#6B7280'` (meta/secondary)
- `COLORS.divider`: `'#E5E7EB'` (hairline dividers)
- `COLORS.primary`: Primary action color (for buttons, indicators)

---

## 7. Typography

**Page Titles:**
- Font size: `22`
- Font weight: `800`
- Color: `'#111111'`
- Letter spacing: `-0.2`

**Brand Mark (6°):**
- Font size: `26`
- Font weight: `800`
- Color: `'#111111'`
- Letter spacing: `-0.5`

**Empty State Title:**
- Font size: `15`
- Font weight: `800`
- Color: `COLORS.textPrimary`
- Line height: `20`

**Empty State Subtitle:**
- Font size: `12`
- Font weight: `400` (default)
- Color: `COLORS.textMuted`

---

## 8. Spacing & Layout

**Container padding:** `16px` horizontal (from `ChatStyles.container`)

**Top bar:**
- Height: `50px`
- Margin top: `-6px` (to align with safe area)
- Padding: None (handled by container)

**Content area:**
- Padding top: `4px`
- Padding bottom: `0px`

**Empty state:**
- Horizontal padding: `24px`
- Card padding: `16px` vertical, `18px` horizontal

---

## 9. Implementation Checklist

When creating or updating a main page, ensure:

- [ ] Uses `ChatStyles.container` for SafeAreaView
- [ ] Uses `ChatStyles.topBar` for header
- [ ] Uses `ChatStyles.brandMark` and `ChatStyles.brandMarkText` for left logo
- [ ] Uses `ChatStyles.centerSlot` and `ChatStyles.title` for page title
- [ ] Uses `homeStyles.content` for content wrapper
- [ ] Uses `homeStyles.emptyWrap`, `emptyCard`, `emptyTitle`, `emptySub` for empty states
- [ ] Right slot uses `ModeToggleButton` (if applicable) or spacer `<View style={{ width: 60 }} />`
- [ ] No custom background colors on content area (inherits white from container)
- [ ] Loading states use `homeStyles.emptyWrap` with `ActivityIndicator`

---

## 10. Example: Complete Page Structure

```jsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../../styles/ChatStyles';
import homeStyles from '../../../styles/HomeStyles';
import { COLORS } from '../../../styles/themeNEW';
import ModeToggleButton from '../../../navigation/ModeToggleButton';

export default function ExamplePage() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.brandMark} hitSlop={10}>
          <Text style={styles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={styles.centerSlot}>
          <Text style={styles.title}>Example</Text>
        </View>

        {/* Right slot - choose one: */}
        <ModeToggleButton mode={mode} onModeChange={setMode} ... />
        {/* OR */}
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={homeStyles.content}>
        {/* Your page content here */}
        
        {/* OR empty state */}
        <View style={homeStyles.emptyWrap}>
          <View style={homeStyles.emptyCard}>
            <Text style={homeStyles.emptyTitle}>No items yet</Text>
            <Text style={homeStyles.emptySub}>Description of empty state.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
```

---

## Notes

- **HomeStyles** is used for content layout and empty states
- **ChatStyles** is used for container, top bar, and header elements
- All pages share the same white background (`#FFFFFF`)
- Empty states are consistent across all pages
- The top bar structure is identical across all pages (only right slot varies)
