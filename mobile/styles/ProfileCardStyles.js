// mobile/styles/ProfileCardStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from './themeNEW';

const RADIUS = 26;

const styles = StyleSheet.create({
  // -------------------------
  // Base card
  // -------------------------
  card: {
    height: '100%',
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
    flexDirection: 'column',
  },
  cardExpanded: {
    borderRadius: RADIUS,
    shadowOpacity: 0.10,
    shadowRadius: 20,
  },

  // -------------------------
  // Photo area
  // -------------------------
  photoContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: COLORS.backgroundSubtle,
  },
  photoContainerExpanded: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: 'hidden',
  },
  photo: {
    // width: '100%',
    // height: '100%',
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,

  },

  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: COLORS.textDisabled,
    fontSize: 15,
    fontWeight: '700',
  },

  // Story progress bar
  progressWrap: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    zIndex: 40,
    elevation: 10,
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.88)',
    width: '0%',
  },

  // Tap zones for photo cycling
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 10,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 10,
  },

  // -------------------------
  // Caption overlay
  // -------------------------
  captionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    elevation: 8,
    paddingTop: 18,
    paddingBottom: 14,
  },

  captionTapArea: {
    paddingHorizontal: 16,
    paddingRight: 62, // room for chevron button
  },

  nameText: {
    color: COLORS.textInverse,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  ageText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '700',
  },

  contextLineContainer: {
    marginTop: 6,
  },
  contextLineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  // Mutuals chip: background only; number + icon use contextLineBold and contextLineMutualsIcon
  contextLineMutualsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#36A8FF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  contextLineMutualsIcon: {
    marginLeft: 2,
  },
  contextLine: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    letterSpacing: 0.1,
    fontWeight: '700',
  },
  // Number and "+" in mutuals chip (bold)
  contextLineBold: {
    color: 'white',
    fontSize: 13,
    letterSpacing: 0.1,
    fontWeight: '900',
  },

  bioText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: '600',
  },

  // Menu button (three dots)
  menuButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 40,
  },
  menuButtonText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Chevron
  moreChevronBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    zIndex: 80,
    elevation: 20,
  },
  moreChevronText: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 1,
  },

  // -------------------------
  // Expanded scroll
  // -------------------------
  expandedScrollContent: {
    paddingBottom: 50,
  },

  // Backdrop when expanded
  expandedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },

  // -------------------------
  // Expanded details content
  // -------------------------
  expandedContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: COLORS.surface,
  },

  section: {
    paddingVertical: 14,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.borderMuted ?? 'rgba(0,0,0,0.08)',
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.0,
    color: COLORS.textMuted,
    marginBottom: 10,
  },

  aboutLine: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  aboutLineSecondary: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: COLORS.textBody,
    marginBottom: 6,
  },

  // ON CAMPUS inline row with dot dividers
  inlineLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: 10,
  },
  inlineDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
    marginHorizontal: 10,
  },
  inlineItem: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // INTERESTS inline text
  inlineText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 21,
  },

  photoClipped: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },

  photoContainerHardware: {
    // helps prevent one-frame mask glitches during height animation
    renderToHardwareTextureAndroid: true,
    shouldRasterizeIOS: true,
  },

  // Friend button
  friendButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  friendButtonActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  friendButtonPending: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  friendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },

});

export default styles;
