// mobile/styles/AuthStyles.v3.js
import { StyleSheet, Platform } from 'react-native';

/**
 * AUTH STYLE GUIDE v3
 * - One consistent dark gradient for all auth steps
 * - White centered "6°" logo (no circle)
 * - Glass inputs, crisp borders, white CTA
 * - Shared components: inputs, chips, select fields, preference cards, iOS modal sheet
 */

export const AUTH_GRADIENT_CONFIG = {
  colors: ['#0F3B61', '#2B86D6'],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

const TOKENS = {
  // Text on gradient
  white: '#FFFFFF',
  whiteMuted: 'rgba(255,255,255,0.82)',
  whiteSubtle: 'rgba(255,255,255,0.64)',
  placeholder: 'rgba(255,255,255,0.62)',

  // Glass surfaces
  surface: 'rgba(255,255,255,0.12)',
  surfaceStrong: 'rgba(255,255,255,0.16)',

  // Borders
  border: 'rgba(255,255,255,0.22)',
  borderFocus: 'rgba(255,255,255,0.40)',

  // CTA text (brand blue)
  brandText: '#1F6299',

  // Error
  danger: '#FF6B6B',
  dangerBg: 'rgba(255,107,107,0.12)',
  dangerBorder: 'rgba(255,107,107,0.55)',

  // Modal
  modalOverlay: 'rgba(0,0,0,0.45)',
  modalCard: '#FFFFFF',
  modalMuted: '#6B7280',
  modalPrimary: '#1F6299',
};

const SPACE = {
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 44,
};

const RADIUS = {
  input: 16,
  card: 20,
  button: 999,
  chip: 999,
};

const FONT = {
  logo: 54,
  title: 32,
  subtitle: 14,
  label: 14,
  body: 16,
  hint: 13,
  error: 12,
};

const styles = StyleSheet.create({
  // Handy helper so you can do: style={styles.gradientFill}
  gradientFill: { flex: 1 },

  // Screen base
  authContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  authContent: {
    paddingTop: SPACE.l,
    paddingBottom: SPACE.l,
    alignItems: 'center',
  },

  // Back button
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
  },
  backText: {
    color: TOKENS.whiteMuted,
    fontSize: 15,
  },

  // Header (white logo text)
  logo: {
    fontSize: FONT.logo,
    fontWeight: '800',
    color: TOKENS.white,
    textAlign: 'center',
    marginTop: SPACE.s,
    marginBottom: SPACE.s,
  },

  // Titles
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    color: TOKENS.white,
    textAlign: 'center',
    marginTop: SPACE.s,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 10,
    color: TOKENS.whiteSubtle,
    fontSize: FONT.subtitle,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form layout
  formWrap: {
    width: '100%',
    marginTop: SPACE.l,
  },
  fieldBlock: {
    width: '100%',
    marginBottom: SPACE.m,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACE.xs,
  },

  // Labels & errors
  label: {
    color: TOKENS.whiteMuted,
    fontSize: FONT.label,
    fontWeight: '600',
  },
  inlineError: {
    color: TOKENS.danger,
    fontSize: FONT.error,
    fontWeight: '600',
  },
  errorText: {
    color: TOKENS.danger,
    marginTop: SPACE.xs,
    fontSize: 13,
    fontWeight: '600',
  },

  // Inputs
  input: {
    width: '100%',
    backgroundColor: TOKENS.surface,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 14, android: 12 }),
    color: TOKENS.white,
    fontSize: FONT.body,
    borderWidth: 1,
    borderColor: TOKENS.border,
  },
  inputFocused: {
    borderColor: TOKENS.borderFocus,
    backgroundColor: TOKENS.surfaceStrong,
  },
  inputError: {
    borderColor: TOKENS.dangerBorder,
    backgroundColor: TOKENS.dangerBg,
  },

  // Pressable select field (DOB / Grad Year)
  selectField: {
    width: '100%',
    backgroundColor: TOKENS.surface,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: TOKENS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldError: {
    borderColor: TOKENS.dangerBorder,
    backgroundColor: TOKENS.dangerBg,
  },
  selectPlaceholderText: {
    color: TOKENS.placeholder,
    fontSize: FONT.body,
  },
  selectValueText: {
    color: TOKENS.white,
    fontSize: FONT.body,
    fontWeight: '500',
  },
  selectChevron: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 22,
    marginLeft: 12,
  },

  // Primary button
  primaryButton: {
    marginTop: SPACE.xl,
    backgroundColor: TOKENS.white,
    paddingVertical: 16,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: TOKENS.brandText,
    fontSize: 17,
    fontWeight: '600',
  },

  // Preference cards (Step 3)
  preferenceCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.card,
    padding: SPACE.m,
    marginBottom: SPACE.m,
  },
  preferenceTitle: {
    color: TOKENS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  preferenceHint: {
    marginTop: 4,
    color: TOKENS.whiteSubtle,
    fontSize: FONT.hint,
  },

  // Chips (Gender + Preferences)
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: SPACE.s,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.chip,
    borderWidth: 1,
    borderColor: TOKENS.border,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: TOKENS.borderFocus,
  },
  chipText: {
    color: TOKENS.whiteMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: TOKENS.white,
    fontWeight: '700',
  },

  // iOS modal (DOB + Grad Year)
  dateModalOverlay: {
    flex: 1,
    backgroundColor: TOKENS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dateModalContent: {
    width: '92%',
    backgroundColor: TOKENS.modalCard,
    borderRadius: 18,
    paddingTop: 8,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  dateModalCancel: {
    fontSize: 16,
    color: TOKENS.modalMuted,
  },
  dateModalDone: {
    fontSize: 16,
    color: TOKENS.modalPrimary,
    fontWeight: '600',
  },
});

// Expose placeholder token for convenient usage in screens
styles.tokens = {
  placeholder: TOKENS.placeholder,
};

export default styles;
export { SPACE };
