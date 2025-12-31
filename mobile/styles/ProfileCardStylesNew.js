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
    flexDirection: 'column', // Stack photo and expanded content vertically
  },
  cardExpanded: {
    borderRadius: RADIUS, // Keep rounded corners
    shadowOpacity: 0.10,
    shadowRadius: 20,
  },

  photoContainer: {
    position: 'relative',
    backgroundColor: COLORS.backgroundSubtle,
    width: '100%',
    // Height is animated in component
  },
  photoContainerExpanded: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: 'hidden',
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
  // Made larger for easier tapping
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%', // Increased from 42% for easier tapping
    zIndex: 10,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%', // Increased from 42% for easier tapping
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
    fontSize: 20, // Slightly smaller than nameText (which is 24)
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '700', // Slightly lighter than nameText (which is 900)
  },

  contextLineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  contextLine: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    letterSpacing: 0.1,
    fontWeight: '700',
  },
  mutualsChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  mutualsChipText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
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
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: COLORS.textMuted ?? 'rgba(0,0,0,0.65)',
    marginBottom: 12,
  },
  
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textBody,
    fontWeight: '600',
  },

  affiliationChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.surface, // white
    borderWidth: 1,
    borderColor: COLORS.borderMuted, // very light
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  
  affiliationChipText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    color: COLORS.textPrimary,
  },
  
  interestChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  
  interestChipText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    color: COLORS.textBody,
  },
  

  // Background text - footnote style
  backgroundText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  // Expanded scroll content (contains photo + all content)
  expandedScrollContent: {
    paddingBottom: 50, // Extra padding to ensure content isn't cut off by nav bar
  },

  // Backdrop when expanded
  expandedBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998, // Below card but above everything else
  },

  expandedContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: COLORS.background, // was surfaceSubtle
  },
  
  sectionCard: {
    backgroundColor: COLORS.backgroundSubtle, // VSCO slab
    borderRadius: 22,
    padding: 16,
    borderWidth: 0,        // IMPORTANT: no borders
    shadowOpacity: 0,      // IMPORTANT: no shadows
    elevation: 0,
    marginBottom: 16,
  },
  

// If you use sectionCard, reduce expandedSection spacing so it doesn't double-space
expandedSection: {
  marginBottom: 16,
},

  expandedSection: {
    marginBottom: 32, // major rhythm
  },
  
expandedParagraph: {
  fontSize: 14,
  lineHeight: 20,
  color: COLORS.textBody,
  fontWeight: '500',
},

// About block hierarchy
aboutStack: {
  // header → content spacing already handled by sectionTitle marginBottom
},


aboutPrimary: {
  fontSize: 18,
  fontWeight: '700',
  lineHeight: 24,
  color: COLORS.textPrimary,
},

aboutSecondary: {
  marginTop: 8,
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 22,
  color: COLORS.textBody,
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


sectionHeaderRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  marginBottom: 12,
},

sectionAccentDot: {
  width: 8,
  height: 8,
  borderRadius: 999,
  backgroundColor: COLORS.accent,
  opacity: 0.85,
},

sectionTitle: {
  fontSize: 20,          // bigger
  fontWeight: '800',
  lineHeight: 24,
  color: COLORS.textPrimary,
  marginBottom: 12,
},

fieldLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: COLORS.textMuted,
  marginBottom: 6,
},

affRow: {
  backgroundColor: COLORS.surface,
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 14,
  marginBottom: 10,
},

affRowText: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.textPrimary,
},

moreRow: {
  marginTop: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 12,
},

moreRowText: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.accent, // accent ONLY here
},

expandedContent: {
  paddingHorizontal: 18,
  paddingTop: 16,
  paddingBottom: 22,
  backgroundColor: COLORS.surface,   // one surface only
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

bodyStrong: {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: '700',
  color: COLORS.textPrimary,
  marginBottom: 6,
},

body: {
  fontSize: 16,
  lineHeight: 22,
  fontWeight: '500',
  color: COLORS.textBody,
  marginBottom: 6,
},

inlineWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
},

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

inlineText: {
  fontSize: 15,
  fontWeight: '600',
  color: COLORS.textPrimary,
  lineHeight: 21,
},

tag: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 12, // less pill-y than 999
  backgroundColor: COLORS.backgroundSubtle, // subtle fill
},

tagText: {
  fontSize: 14,
  fontWeight: '600',
  color: COLORS.textPrimary,
},

tagSoft: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: COLORS.borderMuted ?? 'rgba(0,0,0,0.10)',
  backgroundColor: 'transparent',
},

tagSoftText: {
  fontSize: 14,
  fontWeight: '500',
  color: COLORS.textBody,
},


});

export default styles;
