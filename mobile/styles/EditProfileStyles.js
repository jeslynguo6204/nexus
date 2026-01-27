/**
 * Edit Profile / Profile Details form styles.
 * Aligned with Instagram-style edit profile: clean rows, label left, value/control right.
 * Uses themeNEW for colors; shares typography and spacing with Chat/Matches.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from './themeNEW';

export const EDIT_PROFILE = {
  rowPaddingVertical: 14,
  rowPaddingHorizontal: 16,
  labelFontSize: 16,
  labelFontWeight: '500',
  labelColor: COLORS.textPrimary,
  valueFontSize: 16,
  valueColor: COLORS.textPrimary,
  placeholderColor: COLORS.textMuted,
  chevronColor: COLORS.textMuted,
  linkColor: '#2563EB',
  avatarSize: 76,
  sectionSpacing: 8,
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  headerBack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSave: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: EDIT_PROFILE.linkColor,
  },

  photoBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: EDIT_PROFILE.avatarSize,
    height: EDIT_PROFILE.avatarSize,
    borderRadius: EDIT_PROFILE.avatarSize / 2,
    backgroundColor: COLORS.backgroundSubtle,
  },
  avatarImage: {
    width: EDIT_PROFILE.avatarSize,
    height: EDIT_PROFILE.avatarSize,
    borderRadius: EDIT_PROFILE.avatarSize / 2,
  },
  editPhotoLink: {
    marginTop: 14,
  },
  editPhotoLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: EDIT_PROFILE.linkColor,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: EDIT_PROFILE.rowPaddingVertical,
    paddingHorizontal: EDIT_PROFILE.rowPaddingHorizontal,
    minHeight: 52,
  },
  rowTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: EDIT_PROFILE.rowPaddingVertical,
    paddingHorizontal: EDIT_PROFILE.rowPaddingHorizontal,
    minHeight: 52,
  },
  rowLabel: {
    fontSize: EDIT_PROFILE.labelFontSize,
    fontWeight: EDIT_PROFILE.labelFontWeight,
    color: EDIT_PROFILE.labelColor,
    minWidth: 120,
    marginRight: 12,
  },
  rowValue: {
    flex: 1,
    fontSize: EDIT_PROFILE.valueFontSize,
    fontWeight: '400',
    color: EDIT_PROFILE.valueColor,
    textAlign: 'right',
  },
  rowValueMuted: {
    color: EDIT_PROFILE.placeholderColor,
  },
  rowChevron: {
    marginLeft: 8,
  },

  inputInline: {
    flex: 1,
    fontSize: EDIT_PROFILE.valueFontSize,
    fontWeight: '400',
    color: EDIT_PROFILE.valueColor,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 24,
    textAlign: 'right',
  },

  chipsWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
    marginLeft: 16,
  },

  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionHeaderFirst: {
    paddingTop: 16,
  },

  // Instagram-style single-field edit (Likes/Dislikes modal)
  singleFieldLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  singleFieldInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
    marginHorizontal: 16,
    marginBottom: 20,
  },

  // Bio edit modal (Instagram-style: large area, counter, helper)
  bioInputWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    minHeight: 160,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  bioInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
    padding: 0,
    minHeight: 130,
    textAlignVertical: 'top',
  },
  bioCounter: {
    position: 'absolute',
    right: 16,
    bottom: 10,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  bioHelper: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bioHelperLink: {
    color: EDIT_PROFILE.linkColor,
  },
});
