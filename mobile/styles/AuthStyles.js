// mobile/styles/AuthStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from './theme';

const styles = StyleSheet.create({
  // -------------------- Shared base auth styles --------------------
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 96,
    paddingBottom: 32,
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

  // -------------------- EntryScreen --------------------
  entryContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
    width: '80%',
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

  // -------------------- Signup / link styles --------------------
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

  // -------------------- Date picker modal --------------------
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

  // -------------------- LoginScreen --------------------
  loginContainer: {
    flex: 1,
    backgroundColor: '#1F6299',
    paddingHorizontal: 24,
  },
  loginContent: {
    flexGrow: 1,
    paddingTop: 40,
    alignItems: 'center',
  },

  // top-left back button
  loginBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
  },
  loginBackText: {
    color: '#E5F2FF',
    fontSize: 15,
  },

  // centered white 6° logo
  loginLogo: {
    fontSize: 52,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 30,
  },

  // centered "Welcome back!"
  loginTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },

  loginLabel: {
    color: '#E5F2FF',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 16,
  },
  loginInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D0E2FF',
    // subtle glow / depth
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  loginForgotWrapper: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  loginForgotText: {
    color: '#E5F2FF',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1F6299',
    fontSize: 16,
    fontWeight: '600',
  },
  loginFooterText: {
    color: '#D0E2FF',
    fontSize: 14,
  },
  loginFooterLink: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default styles;
