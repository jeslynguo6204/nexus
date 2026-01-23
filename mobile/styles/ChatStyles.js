import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  // Top bar
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0,
  },

  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#111111',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  rightSlot: {
    width: 44,
    height: 44,
  },

  // Matches row
  matchesSection: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  matchesRow: {
    paddingRight: 10,
  },
  matchItem: {
    width: 90,
    marginRight: 14,
    alignItems: 'center',
  },
  matchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDEDED',
  },
  matchName: {
    marginTop: 8,
    fontSize: 14,
    color: '#111111',
    maxWidth: 90,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
  },

  // List
  listContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F7',
  },

  // Chat rows
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDEDED',
  },
  chatText: {
    flex: 1,
    marginLeft: 12,
  },

  chatName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  chatPreview: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    maxWidth: '80%',
  },

  timeText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // Unread styling
  unreadName: {
    color: '#111111',
    fontWeight: '700',
  },
  unreadPreview: {
    color: '#111111',
    fontWeight: '600',
  },
  unreadTime: {
    color: '#111111',
    fontWeight: '600',
  },

  // Read styling
  readName: {
    color: '#9CA3AF',
    fontWeight: '700',
  },
  readPreview: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  readTime: {
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // Unread dot (right side)
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F80FF',
    marginLeft: 10,
  },
  dotSpacer: {
    width: 10,
    height: 10,
    marginLeft: 10,
  },

  // Empty states
  emptyStateContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});
