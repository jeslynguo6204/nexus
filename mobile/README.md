# Nexus Mobile (Expo)

This folder contains a minimal Expo-based React Native scaffold to kick off the mobile app UI.

Quick start

1. Install Expo CLI (if you don't have it):

```bash
npm install -g expo-cli
```

2. From `mobile/` install dependencies:

```bash
cd mobile
npm install
```

3. Start the dev server:

```bash
npm run start
# or
npm run ios
npm run android
```

Notes
- API base URL defaults to `http://localhost:4000`. On Android emulators you may need to use `10.0.2.2:4000` instead. You can set `API_BASE_URL` in the environment when starting Expo.
- The scaffold includes:
  - `App.js` - wires auth state and navigation
  - `navigation/BottomTabs.js` - bottom tab navigator with placeholders
  - `screens/AuthScreen.js` - simple login/signup UI (stores token in AsyncStorage)
  - `screens/ProfileScreen.js` - fetches `/profiles/me` and allows editing via `PATCH /profiles/me`
  - `components/ProfileForm.js` - editable form

Next steps I can do for you:
- Wire the real login/signup flows to navigate automatically after auth
- Add form validation and nicer UI
- Implement image uploads for profile pictures
