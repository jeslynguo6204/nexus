// mobile/styles/ProfileCardStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from './theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  imageArea: {
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    height: 320,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInitials: {
    fontSize: 72,
    fontWeight: '800',
    color: COLORS.card,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  age: {
    fontSize: 18,
    color: COLORS.muted,
    marginLeft: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.primarySoft,
    marginRight: 6,
    marginBottom: 4,
  },
  metaChipText: {
    fontSize: 12,
    color: COLORS.text,
  },
  bio: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
  },
});

export default styles;
