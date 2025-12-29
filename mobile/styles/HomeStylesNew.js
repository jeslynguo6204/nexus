// mobile/styles/HomeStylesNew.js
import { StyleSheet } from 'react-native';
import { COLORS } from './themeNEW';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  topBar: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Left: brand mark
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // Center: give the segmented control true center alignment
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderRadius: 999,
    padding: 3,
  },
  segment: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },
  segmentTextActive: {
    color: COLORS.textPrimary,
  },

  // Right: mode mini-pill (editorial toggle)
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderRadius: 999,
    padding: 3,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  modeOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  modeIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modeIconActive: {
    color: COLORS.textPrimary,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  modeTextActive: {
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 0,
  },

  // Empty state (unchanged)
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
  // Right: mode chip
modeChip: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  height: 34,
  paddingHorizontal: 12,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.70)',
},
modeChipGlyph: {
  fontSize: 12,
  fontWeight: '900',
  color: COLORS.textPrimary,
  marginTop: 1,
},
modeChipText: {
  fontSize: 12,
  fontWeight: '800',
  color: COLORS.textPrimary,
  letterSpacing: 0.2,
},
modeChipChevron: {
  fontSize: 11,
  color: COLORS.textMuted,
  marginTop: 1,
},

// Popover (menu)
popoverOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.08)', // super light dim; feels editorial
},
modePopover: {
  position: 'absolute',
  width: 190,
  borderRadius: 16,
  backgroundColor: 'rgba(255,255,255,0.92)',
  padding: 10,
  // subtle "card" feel without looking like a heavy modal
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.06)',
},
popoverTitle: {
  fontSize: 11,
  fontWeight: '900',
  color: COLORS.textMuted,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  paddingHorizontal: 6,
  paddingTop: 2,
  paddingBottom: 6,
},
popoverRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 12,
},
popoverRowActive: {
  backgroundColor: 'rgba(0,0,0,0.04)',
},
popoverRowGlyph: {
  fontSize: 13,
  fontWeight: '900',
  color: COLORS.textMuted,
},
popoverRowGlyphActive: {
  color: COLORS.textPrimary,
},
popoverRowText: {
  fontSize: 13,
  fontWeight: '800',
  color: COLORS.textPrimary,
},
popoverRowTextActive: {
  color: COLORS.textPrimary,
},
// Right: glyph-only mode chip (saves space)
modeGlyphChip: {
  width: 34,
  height: 34,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.70)',
  alignItems: 'center',
  justifyContent: 'center',
},
modeGlyph: {
  fontSize: 13,
  fontWeight: '900',
  color: COLORS.textPrimary,
  marginTop: 1,
},

// Popover overlay (keep it LIGHT)
popoverOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.06)',
},

// Popover menu (clamped in JS, so just absolute)
modePopover: {
  position: 'absolute',
  borderRadius: 16,
  backgroundColor: 'rgba(255,255,255,0.95)',
  padding: 10,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.06)',
},

popoverTitle: {
  fontSize: 11,
  fontWeight: '900',
  color: COLORS.textMuted,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  paddingHorizontal: 6,
  paddingTop: 2,
  paddingBottom: 6,
},

popoverRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 12,
},
popoverRowActive: {
  backgroundColor: 'rgba(0,0,0,0.04)',
},
popoverRowGlyph: {
  fontSize: 13,
  fontWeight: '900',
  color: COLORS.textMuted,
},
popoverRowGlyphActive: {
  color: COLORS.textPrimary,
},
popoverRowText: {
  fontSize: 13,
  fontWeight: '800',
  color: COLORS.textPrimary,
},
popoverRowTextActive: {
  color: COLORS.textPrimary,
},

});

export default styles;
