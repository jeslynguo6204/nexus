// mobile/components/MoreAboutMeSheet.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../styles/themeNEW';

export default function MoreAboutMeSheet({
  visible,
  onClose,
  height,
  languages,
  religiousBeliefs,
  politicalAffiliation,
  ethnicity,
  sexuality,
}) {
  const insets = useSafeAreaInsets();

  const formatValue = (value) => {
    if (!value || value === 'null' || value === '') return null;
    return value;
  };

  // Group fields with intentional spacing - show all fields, even if null
  const group1 = [
    { label: 'Height', value: formatValue(height) },
    { label: 'Languages', value: formatValue(languages) },
  ];

  const group2 = [
    { label: 'Religion', value: formatValue(religiousBeliefs) },
    { label: 'Politics', value: formatValue(politicalAffiliation) },
  ];

  const group3 = [
    { label: 'Ethnicity', value: formatValue(ethnicity) },
    { label: 'Sexuality', value: formatValue(sexuality) },
  ];

  const allRows = [...group1, ...group2, ...group3];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>More about me</Text>
              <Text style={styles.subtitle}>Shared only if you choose</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <FontAwesome name="times" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Group 1: Physical / Neutral */}
            <View style={styles.group}>
              {group1.map((row, index) => (
                <View key={index} style={styles.fieldBlock}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={[
                    styles.value,
                    !row.value && styles.valuePlaceholder
                  ]}>
                    {row.value || 'Prefer not to say'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Group 2: Beliefs / Worldview */}
            <View style={styles.group}>
              {group2.map((row, index) => (
                <View key={index} style={styles.fieldBlock}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={[
                    styles.value,
                    !row.value && styles.valuePlaceholder
                  ]}>
                    {row.value || 'Prefer not to say'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Group 3: Identity */}
            <View style={styles.group}>
              {group3.map((row, index) => (
                <View key={index} style={styles.fieldBlock}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={[
                    styles.value,
                    !row.value && styles.valuePlaceholder
                  ]}>
                    {row.value || 'Prefer not to say'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(255, 255, 255, 0.98)', // Slight translucency
    borderTopLeftRadius: 28, // Larger corner radius
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
  },
  title: {
    fontSize: 19,
    fontWeight: '600', // Medium-semibold, not bold
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
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  group: {
    marginBottom: 24, // Intentional spacing between groups
  },
  fieldBlock: {
    marginBottom: 18, // 16-20px between blocks
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginBottom: 8, // 8-12px between label and value
    letterSpacing: 0,
    textTransform: 'none', // Sentence case, not uppercase
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
    lineHeight: 22, // Relaxed line height (1.4)
  },
  valuePlaceholder: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    fontWeight: '300', // Lighter weight for "Prefer not to say"
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

