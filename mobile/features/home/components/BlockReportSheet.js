// mobile/features/home/components/BlockReportSheet.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../styles/themeNEW';
import { blockUser, reportUser } from '../../../api/blocksAPI';
import { getIdToken } from '../../../auth/tokens';
import { formatUserError, logAppError } from '../../../utils/errors';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'stalking', label: 'Stalking' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'scam', label: 'Scam' },
  { value: 'violated_terms', label: 'Violated Terms' },
  { value: 'other', label: 'Other' },
];

export default function BlockReportSheet({
  visible,
  onClose,
  userId,
  userName,
  onBlocked,
  initialMode = 'menu', // 'menu' or 'report' - allows skipping menu to go directly to report
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState(initialMode); // 'menu', 'report', 'reportDetails'
  const [selectedReason, setSelectedReason] = useState(null);
  const [reportDetails, setReportDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setMode(initialMode);
    setSelectedReason(null);
    setReportDetails('');
    onClose();
  };
  
  // Reset mode when sheet opens/closes
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      setSelectedReason(null);
      setReportDetails('');
    }
  }, [visible, initialMode]);

  const handleBlock = async () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${userName || 'this user'}? You won't see each other anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await getIdToken();
              if (!token) {
                Alert.alert('Error', 'Please log in again');
                return;
              }
              await blockUser(token, userId);
              Alert.alert('Success', 'User blocked successfully', [
                { text: 'OK', onPress: () => {
                  handleClose();
                  if (onBlocked) onBlocked();
                }},
              ]);
            } catch (error) {
              console.error('Error blocking user:', error);
              logAppError(error, { screen: 'BlockReport', action: 'block' });
              Alert.alert('Error', formatUserError(error, 'Failed to block user'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReport = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }

    if (selectedReason === 'other' && !reportDetails.trim()) {
      Alert.alert('Error', 'Please provide details for your report');
      return;
    }

    try {
      setLoading(true);
      const token = await getIdToken();
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }
      await reportUser(
        token,
        userId,
        selectedReason,
        selectedReason === 'other' ? reportDetails : null
      );
      Alert.alert('Success', 'Report submitted successfully', [
        { text: 'OK', onPress: handleClose },
      ]);
    } catch (error) {
      console.error('Error reporting user:', error);
      logAppError(error, { screen: 'BlockReport', action: 'report' });
      Alert.alert('Error', formatUserError(error, 'Failed to submit report'));
    } finally {
      setLoading(false);
    }
  };

  const renderMenu = () => (
    <View style={styles.content}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => setMode('report')}
      >
        <FontAwesome name="flag" size={18} color={COLORS.textPrimary} />
        <Text style={styles.menuItemText}>Report User</Text>
        <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.menuItem, styles.menuItemDestructive]}
        onPress={handleBlock}
        disabled={loading}
      >
        <FontAwesome name="ban" size={18} color="#FF3B30" />
        <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>
          Block User
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderReport = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.reportContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.reportTitle}>Why are you reporting this user?</Text>
      <Text style={styles.reportSubtitle}>
        Your report is anonymous. The reported user won't know who reported them.
      </Text>

      {REPORT_REASONS.map((reason) => (
        <TouchableOpacity
          key={reason.value}
          style={[
            styles.reasonItem,
            selectedReason === reason.value && styles.reasonItemSelected,
          ]}
          onPress={() => {
            setSelectedReason(reason.value);
            if (reason.value !== 'other') {
              setMode('reportDetails');
            }
          }}
        >
          <Text
            style={[
              styles.reasonText,
              selectedReason === reason.value && styles.reasonTextSelected,
            ]}
          >
            {reason.label}
          </Text>
          {selectedReason === reason.value && (
            <FontAwesome name="check" size={16} color={COLORS.accent} />
          )}
        </TouchableOpacity>
      ))}

      {selectedReason === 'other' && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsLabel}>Please provide details:</Text>
          <TextInput
            style={styles.detailsInput}
            multiline
            numberOfLines={4}
            placeholder="Describe the issue..."
            value={reportDetails}
            onChangeText={setReportDetails}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      )}

      {selectedReason && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {mode === 'menu' ? (
                <>
                  <Text style={styles.title}>Options</Text>
                  <Text style={styles.subtitle}>
                    {userName || 'User'} • {userId}
                  </Text>
                </>
              ) : mode === 'report' ? (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setMode('menu');
                      setSelectedReason(null);
                    }}
                    style={styles.backButton}
                  >
                    <FontAwesome name="chevron-left" size={16} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.title}>Report User</Text>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setMode('report')}
                    style={styles.backButton}
                  >
                    <FontAwesome name="chevron-left" size={16} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.title}>Report Details</Text>
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <FontAwesome name="times" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {mode === 'menu' && renderMenu()}
          {(mode === 'report' || mode === 'reportDetails') && renderReport()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemDestructive: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  menuItemTextDestructive: {
    color: '#FF3B30',
  },
  reportContent: {
    paddingBottom: 32,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 12,
  },
  reasonItemSelected: {
    backgroundColor: COLORS.accent + '15',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  reasonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  reasonTextSelected: {
    color: COLORS.accent,
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: 24,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  detailsInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
