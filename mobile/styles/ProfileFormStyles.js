// mobile/styles/ProfileFormStyles.js
import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#36A8FF',        // main blue (tweak as you like)
  primarySoft: '#E1F1FF',    // soft blue background
  background: '#F3F7FC',     // app background
  card: '#FFFFFF',           // cards
  text: '#0F172A',           // main text
  muted: '#6B7280',          // secondary text
  border: '#D0E2FF',         // subtle borders
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    // soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  firstSectionTitle: {
    marginTop: 0,
  },

  label: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 4,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 6,
    fontWeight: '500',
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
  },
  readonlyField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  readonlyText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  gradYearRow: {
    marginTop: 4,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    marginBottom: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  chipTextSelected: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  saveButtonContainer: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  sectionSpacer: {
    height: 12,
  },

  mutuals: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;
