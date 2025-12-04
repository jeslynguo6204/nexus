// mobile/styles/AuthStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.card,
  },
  modeButtonText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 44,
    width: '100%',
  },
  errorText: {
    color: '#D23F44',
    marginTop: 6,
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // ENTRY SCREEN
  entryContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  entryTop: {
    alignItems: 'center',
    marginTop: 40,
  },
  entryLogoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  entryLogoText: {
    color: COLORS.primary,
    fontSize: 44,
    fontWeight: '800',
  },
  entryAppName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  entryTagline: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  entryBottom: {
    alignItems: 'center',
  },
  entryPrimaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  entryPrimaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.primary,
  },
  entrySecondaryText: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 24,
  },
  entrySecondaryLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  entryLegalText: {
    fontSize: 11,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 16,
  },

  // LOGIN/SIGNUP LINKS
  switchAuthRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  switchAuthLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // DATE PICKER MODAL
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dateModalCancel: {
    fontSize: 16,
    color: COLORS.muted,
  },
  dateModalDone: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default styles;
