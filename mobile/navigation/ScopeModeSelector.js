// mobile/navigation/ScopeModeSelector.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../styles/themeNEW';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const POPOVER_W = 200;
const POPOVER_H = 150;
const EDGE = 12;

export default function ScopeModeSelector({
  scope = 'school',
  mode = 'romantic',
  onScopeChange,
  onModeChange,
  scopeLabels = {
    school: 'Penn',
    league: 'Ivy League',
    area: 'Philadelphia',
  },
  style,
}) {
  const insets = useSafeAreaInsets();

  // Mode menu (popover)
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const modeChipRef = useRef(null);

  const modeGlyph = mode === 'romantic' ? '♡' : '⟡';

  const openModeMenu = () => {
    requestAnimationFrame(() => {
      if (!modeChipRef.current?.measureInWindow) {
        setModeMenuOpen(true);
        return;
      }

      modeChipRef.current.measureInWindow((x, y, w, h) => {
        const { width: winW, height: winH } = Dimensions.get('window');

        // Align popover right edge with chip right edge
        let left = x + w - POPOVER_W;
        let top = y + h + 8;

        // Clamp inside visible area (respect safe areas)
        left = clamp(left, EDGE, winW - POPOVER_W - EDGE);
        top = clamp(top, insets.top + EDGE, winH - POPOVER_H - EDGE);

        setPopoverPos({ top, left });
        setModeMenuOpen(true);
      });
    });
  };

  const handleScopeChange = (newScope) => {
    if (onScopeChange) {
      onScopeChange(newScope);
    }
  };

  const handleModeChange = (newMode) => {
    setModeMenuOpen(false);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  return (
    <>
      <View style={[styles.container, style]}>
        <View style={styles.centerSlot}>
          <View style={styles.segmented}>
            <Pressable
              onPress={() => handleScopeChange('school')}
              style={[styles.segment, scope === 'school' && styles.segmentActive]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, scope === 'school' && styles.segmentTextActive]}>
                {scopeLabels.school}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleScopeChange('league')}
              style={[styles.segment, scope === 'league' && styles.segmentActive]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, scope === 'league' && styles.segmentTextActive]}>
                {scopeLabels.league}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleScopeChange('area')}
              style={[styles.segment, scope === 'area' && styles.segmentActive]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, scope === 'area' && styles.segmentTextActive]}>
                {scopeLabels.area}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Glyph-only mode chip */}
        <Pressable
          ref={modeChipRef}
          onPress={openModeMenu}
          style={styles.modeGlyphChip}
          hitSlop={10}
        >
          <Text style={styles.modeGlyph}>{modeGlyph}</Text>
        </Pressable>
      </View>

      {/* Mode popover */}
      <Modal
        visible={modeMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModeMenuOpen(false)}
      >
        <Pressable style={styles.popoverOverlay} onPress={() => setModeMenuOpen(false)}>
          <Pressable
            onPress={() => {}}
            style={[
              styles.modePopover,
              { width: POPOVER_W, top: popoverPos.top, left: popoverPos.left },
            ]}
          >
            <Text style={styles.popoverTitle}>Mode</Text>

            <Pressable
              onPress={() => handleModeChange('romantic')}
              style={[styles.popoverRow, mode === 'romantic' && styles.popoverRowActive]}
            >
              <Text
                style={[
                  styles.popoverRowGlyph,
                  mode === 'romantic' && styles.popoverRowGlyphActive,
                ]}
              >
                ♡
              </Text>
              <Text
                style={[
                  styles.popoverRowText,
                  mode === 'romantic' && styles.popoverRowTextActive,
                ]}
              >
                Romantic
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleModeChange('platonic')}
              style={[styles.popoverRow, mode === 'platonic' && styles.popoverRowActive]}
            >
              <Text
                style={[
                  styles.popoverRowGlyph,
                  mode === 'platonic' && styles.popoverRowGlyphActive,
                ]}
              >
                ⟡
              </Text>
              <Text
                style={[
                  styles.popoverRowText,
                  mode === 'platonic' && styles.popoverRowTextActive,
                ]}
              >
                Platonic
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },

  // Center: segmented control
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

  // Right: glyph-only mode chip
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

  // Popover overlay (tap outside closes)
  popoverOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  // Popover menu
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

