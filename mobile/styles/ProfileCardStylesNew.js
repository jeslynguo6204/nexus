// mobile/styles/ProfileCardStylesNew.js
import { StyleSheet } from 'react-native';
import { COLORS } from './themeNEW';

const RADIUS = 26;

const styles = StyleSheet.create({
  // --- Base card ---
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
  },

  photoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.backgroundSubtle,
  },

  photo: {
    width: '100%',
    height: '100%',
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

  // Tap zones for photo cycling (we'll clamp their bottom in the component via inline style)
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '42%',
    zIndex: 10,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '42%',
    zIndex: 10,
  },

  // Caption overlay
  captionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 22,
    paddingBottom: 16,
    zIndex: 30,
    elevation: 8,
  },

  // tappable caption area
  captionTapArea: {
    paddingHorizontal: 16,
    paddingRight: 62, // leaves room so text doesn't run under chevron button
  },

  handlePill: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
    marginBottom: 10,
  },

  nameText: {
    color: COLORS.textInverse,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  ageText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 22,
    fontWeight: '800',
  },

  contextLine: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.1,
    fontWeight: '700',
  },

  bioText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: '600',
  },

  // Tinder-like "expand" affordance (bottom-right in overlay)
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
    marginTop: 1, // optical centering
  },

  // -------------------------
  // Expanded bottom-sheet modal
  // -------------------------

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.40)',
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -10 },
    elevation: 20,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginTop: 10,
    marginBottom: 10,
  },

  sheetClose: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  sheetCloseText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: -2,
  },

  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  sheetHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },

  sheetAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundSubtle,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.85)',
  },
  sheetAvatar: {
    width: '100%',
    height: '100%',
  },
  sheetAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSubtle,
  },

  sheetHeaderText: {
    flex: 1,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  sheetSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textBody,
  },

  sheetSubMuted: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  sheetSection: {
    marginTop: 14,
  },

  sheetParagraph: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textBody,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.95)',
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  expandedRoot: {
  flex: 1,
  justifyContent: 'flex-end',
},

expandedBackdrop: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.45)',
},

expandedCard: {
  height: '92%',
  backgroundColor: COLORS.surface,
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
  overflow: 'hidden',
},

expandedClose: {
  position: 'absolute',
  top: 14,
  right: 14,
  width: 36,
  height: 36,
  borderRadius: 999,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.25)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
  zIndex: 50,
},

expandedCloseText: {
  color: 'rgba(255,255,255,0.95)',
  fontSize: 22,
  fontWeight: '900',
  marginTop: -2,
},

expandedScroll: {
  flex: 1,
},

expandedContent: {
  paddingBottom: 18,
},

expandedHero: {
  height: 440,
  width: '100%',
  backgroundColor: COLORS.backgroundSubtle,
},

expandedHeroImage: {
  width: '100%',
  height: '100%',
},

expandedHeroPlaceholder: {
  width: '100%',
  height: '100%',
  backgroundColor: COLORS.backgroundSubtle,
},

expandedHeroGradient: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 180,
},

expandedHeroText: {
  position: 'absolute',
  left: 16,
  right: 16,
  bottom: 16,
},

expandedTitle: {
  color: COLORS.textInverse,
  fontSize: 28,
  fontWeight: '900',
  letterSpacing: -0.3,
},

expandedContextLine: {
  marginTop: 6,
  color: 'rgba(255,255,255,0.78)',
  fontSize: 14,
  fontWeight: '700',
},

expandedBioPreview: {
  marginTop: 8,
  color: 'rgba(255,255,255,0.88)',
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '600',
},

expandedBody: {
  paddingHorizontal: 16,
  paddingTop: 14,
  backgroundColor: COLORS.surface,
},

expandedSection: {
  marginTop: 10,
},

expandedParagraph: {
  fontSize: 14,
  lineHeight: 20,
  color: COLORS.textBody,
  fontWeight: '500',
},

});

export default styles;
