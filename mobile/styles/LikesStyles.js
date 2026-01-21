// mobile/styles/LikesStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from './themeNEW';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16, // ✅ match Matches
  },

  // Top bar
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0,
  },

  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#111111',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2, // ✅ match Matches
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
