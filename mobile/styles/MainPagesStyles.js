// mobile/styles/MainPagesStyles.js
/**
 * Unified styles for the 5 main tab pages:
 * - Home/Discover (HomeScreen)
 * - Likes (LikesScreen)
 * - Friends (FriendsScreen)
 * - Chat/Matches (InboxScreen)
 * - Profile (ProfileScreen)
 * 
 * Based on ChatStyles and HomeStyles patterns for consistency.
 */

import { StyleSheet } from 'react-native';
import { COLORS } from './themeNEW';

const styles = StyleSheet.create({
  // ============================================
  // Container & SafeAreaView
  // ============================================
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  // ============================================
  // Top Bar Header
  // ============================================
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0,
    marginTop: -6,
  },

  // Left: Brand mark (6° logo)
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

  // Center: Page title (absolutely centered in header)
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenteredWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  title: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  // Right: Action slot (for ModeToggleButton, icon button, or spacer)
  rightSlot: {
    width: 44,
    height: 44,
  },
  rightSlotIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ============================================
  // Content Area
  // ============================================
  content: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 0,
  },

  // ============================================
  // Empty States
  // ============================================
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptySub: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default styles;
