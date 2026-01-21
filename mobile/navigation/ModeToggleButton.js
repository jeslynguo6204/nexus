// mobile/navigation/ModeToggleButton.js
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

export default function ModeToggleButton({
  mode,
  onModeChange,
  isDatingEnabled = true,
  isFriendsEnabled = true,
}) {
  const insets = useSafeAreaInsets();
  
  // Mode menu (popover)
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const modeGlyph = mode === 'romantic' ? '♡' : '⟡';
  
  // Determine which modes are available
  const canUseRomantic = isDatingEnabled;
  const canUsePlatonic = isFriendsEnabled;
  
  // Determine if button should be disabled (if neither mode is enabled)
  const isButtonDisabled = !canUseRomantic && !canUsePlatonic;

  const openModeMenu = () => {
    if (isButtonDisabled) return;
    
    requestAnimationFrame(() => {
      if (!buttonRef.current?.measureInWindow) {
        setModeMenuOpen(true);
        return;
      }

      buttonRef.current.measureInWindow((x, y, w, h) => {
        const { width: winW, height: winH } = Dimensions.get('window');

        // Align popover right edge with button right edge
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

  const handleModeChange = (newMode) => {
    setModeMenuOpen(false);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  return (
    <>
      <Pressable
        ref={buttonRef}
        onPress={openModeMenu}
        disabled={isButtonDisabled}
        style={[
          styles.button,
          isButtonDisabled && styles.buttonDisabled,
        ]}
        hitSlop={10}
      >
        <Text style={[styles.icon, isButtonDisabled && styles.iconDisabled]}>
          {modeGlyph}
        </Text>
      </Pressable>

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
              onPress={() => canUseRomantic && handleModeChange('romantic')}
              disabled={!canUseRomantic}
              style={[
                styles.popoverRow,
                mode === 'romantic' && styles.popoverRowActive,
                !canUseRomantic && styles.popoverRowDisabled,
              ]}
            >
              <Text
                style={[
                  styles.popoverRowGlyph,
                  mode === 'romantic' && styles.popoverRowGlyphActive,
                  !canUseRomantic && styles.popoverRowGlyphDisabled,
                ]}
              >
                ♡
              </Text>
              <Text
                style={[
                  styles.popoverRowText,
                  mode === 'romantic' && styles.popoverRowTextActive,
                  !canUseRomantic && styles.popoverRowTextDisabled,
                ]}
              >
                Romantic
              </Text>
            </Pressable>

            <Pressable
              onPress={() => canUsePlatonic && handleModeChange('platonic')}
              disabled={!canUsePlatonic}
              style={[
                styles.popoverRow,
                mode === 'platonic' && styles.popoverRowActive,
                !canUsePlatonic && styles.popoverRowDisabled,
              ]}
            >
              <Text
                style={[
                  styles.popoverRowGlyph,
                  mode === 'platonic' && styles.popoverRowGlyphActive,
                  !canUsePlatonic && styles.popoverRowGlyphDisabled,
                ]}
              >
                ⟡
              </Text>
              <Text
                style={[
                  styles.popoverRowText,
                  mode === 'platonic' && styles.popoverRowTextActive,
                  !canUsePlatonic && styles.popoverRowTextDisabled,
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
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  iconDisabled: {
    color: COLORS.textMuted,
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
  popoverRowDisabled: {
    opacity: 0.4,
  },

  popoverRowGlyph: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textMuted,
  },
  popoverRowGlyphActive: {
    color: COLORS.textPrimary,
  },
  popoverRowGlyphDisabled: {
    color: COLORS.textDisabled,
  },

  popoverRowText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  popoverRowTextActive: {
    color: COLORS.textPrimary,
  },
  popoverRowTextDisabled: {
    color: COLORS.textDisabled,
  },
});

