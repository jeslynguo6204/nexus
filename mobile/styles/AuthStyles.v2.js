// mobile/styles/AuthStyles.v2.js
// Sleeker, consistent auth/onboarding styles for Signup Step 1–3 (+ iOS date/year modals)
// Usage: import styles from '../../../styles/AuthStyles.v2';

import { StyleSheet, Platform } from 'react-native';

const COLORS = {
  // Brand background + text
  brandBg: '#1C5A8C', // slightly smoother than #1F6299
  textOnBrand: '#FFFFFF',
  textOnBrandMuted: 'rgba(255,255,255,0.80)',
  textOnBrandSubtle: 'rgba(255,255,255,0.62)',

  // Surfaces on brand bg
  surface: 'rgba(255,255,255,0.10)',
  surface2: 'rgba(255,255,255,0.14)',

  // Lines
  border: 'rgba(255,255,255,0.18)',
  borderFocus: 'rgba(255,255,255,0.34)',

  // CTA
  ctaText: '#1F6299',

  // Status
  danger: '#FF6B6B',
  dangerBg: 'rgba(255,107,107,0.10)',
  dangerBorder: 'rgba(255,107,107,0.55)',

  // Modal
  modalOverlay: 'rgba(0,0,0,0.45)',
  modalCard: '#FFFFFF',
  modalText: '#0F172A',
  modalMuted: '#6B7280',
  modalPrimary: '#1F6299',
};

const SPACE = {
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
};

const RADIUS = {
  input: 14,
  card: 18,
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
  // -------------------- Screen base --------------------
  loginContainer: {
    flex: 1,
    backgroundColor: COLORS.brandBg,
    paddingHorizontal: 24,
  },
  loginContent: {
    paddingTop: SPACE.l,
    paddingBottom: SPACE.l,
    alignItems: 'center',
  },

  // -------------------- Back button --------------------
  loginBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
  },
  loginBackText: {
    color: COLORS.textOnBrandMuted,
    fontSize: 15,
  },

  // -------------------- Header --------------------
  loginLogo: {
    fontSize: FONT.logo,
    fontWeight: '800',
    color: COLORS.textOnBrand,
    textAlign: 'center',
    marginBottom: SPACE.s,
    marginTop: 0,
  },
  loginTitle: {
    fontSize: FONT.title,
    fontWeight: '600',
    color: COLORS.textOnBrand,
    textAlign: 'center',
    marginTop: SPACE.s,
  },
  loginSubtitle: {
    marginTop: 10,
    color: COLORS.textOnBrandSubtle,
    fontSize: FONT.subtitle,
    textAlign: 'center',
    lineHeight: 20,
  },

  // -------------------- Field layout helpers --------------------
  formWrap: {
    width: '100%',
    marginTop: SPACE.l,
  },
  fieldBlock: {
    width: '100%',
    marginBottom: 18,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACE.xs,
  },

  // -------------------- Labels / errors --------------------
  loginLabel: {
    color: COLORS.textOnBrandMuted,
    fontSize: FONT.label,
    fontWeight: '500',
  },
  inlineErrorText: {
    color: COLORS.danger,
    fontSize: FONT.error,
    fontWeight: '500',
  },
  // For non-inline errors (e.g., bottom of screen)
  errorText: {
    color: COLORS.danger,
    marginTop: SPACE.s,
    fontSize: 13,
    fontWeight: '500',
  },

  // -------------------- Inputs --------------------
  loginInput: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 13, android: 12 }),
    color: COLORS.textOnBrand,
    fontSize: FONT.body,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginInputFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.surface2,
  },
  loginInputError: {
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerBg,
  },
  placeholderTextColor: {
    // (Use by passing placeholderTextColor prop in inputs if you want consistency)
    color: 'rgba(255,255,255,0.55)',
  },

  // -------------------- Select field (pressable input) --------------------
  selectField: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldError: {
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerBg,
  },
  selectPlaceholderText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: FONT.body,
  },
  selectValueText: {
    color: COLORS.textOnBrand,
    fontSize: FONT.body,
    fontWeight: '500',
  },
  selectChevron: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 22,
    marginLeft: 12,
  },

  // -------------------- CTA button --------------------
  loginButton: {
    marginTop: SPACE.xl,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: RADIUS.button,
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.ctaText,
    fontSize: 16,
    fontWeight: '600',
  },

  // -------------------- Preference grouping cards (Step 3) --------------------
  preferenceCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: RADIUS.card,
    padding: SPACE.m,
    marginBottom: SPACE.m,
  },
  preferenceTitle: {
    color: COLORS.textOnBrand,
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceHint: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.65)',
    fontSize: FONT.hint,
  },

  // -------------------- Chips (Gender + Preferences) --------------------
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
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: COLORS.borderFocus,
  },
  chipText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.textOnBrand,
    fontWeight: '600',
  },

  // -------------------- Date/Picker modal (used for DOB + Grad Year modals) --------------------
  dateModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dateModalContent: {
    width: '92%',
    backgroundColor: COLORS.modalCard,
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
    color: COLORS.modalMuted,
  },
  dateModalDone: {
    fontSize: 16,
    color: COLORS.modalPrimary,
    fontWeight: '600',
  },

  // Optional: a light divider line inside modal headers if you want it
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(15, 23, 42, 0.10)',
  },
});

export default styles;
