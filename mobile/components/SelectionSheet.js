// mobile/components/SelectionSheet.js
import React, { useEffect } from 'react';
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
import { COLORS } from '../styles/themeNEW';

/**
 * SelectionSheet - A bottom sheet modal for selecting from predefined options
 * @param {boolean} visible - Whether the sheet is visible
 * @param {string} title - Title of the selection sheet
 * @param {Array} options - Array of option objects {id, name, ...} or strings
 * @param {string|number|Array} selected - Currently selected value(s)
 * @param {function} onSelect - Callback when an option is selected (value, option)
 * @param {function} onClose - Callback to close the sheet
 * @param {boolean} allowMultiple - Whether multiple selections are allowed
 * @param {boolean} allowUnselect - Whether selection can be cleared
 */
export default function SelectionSheet({
  visible,
  title,
  options = [],
  selected,
  onSelect,
  onClose,
  allowMultiple = false,
  allowUnselect = true,
}) {
  const insets = useSafeAreaInsets();

  // Debug logging
  useEffect(() => {
    if (visible) {
      console.log('SelectionSheet opened:', {
        title,
        optionsCount: options.length,
        options: options.slice(0, 3), // First 3 for debugging
        selected,
        allowMultiple,
      });
    }
  }, [visible, title, options.length, allowMultiple]);

  // Log when selected prop changes to track updates
  useEffect(() => {
    if (visible) {
      console.log('SelectionSheet selected prop updated:', selected);
    }
  }, [selected, visible]);

  const isSelected = (option) => {
    const value = option.id !== undefined ? option.id : option;
    
    if (allowMultiple) {
      if (!Array.isArray(selected) || selected.length === 0) return false;
      return selected.some(s => {
        // Direct comparison for strings, normalize numbers for numeric IDs
        if (typeof value === 'string' && typeof s === 'string') {
          return s === value;
        }
        // For numeric IDs, normalize both
        const optionId = typeof value === 'string' ? (isNaN(parseInt(value, 10)) ? value : parseInt(value, 10)) : value;
        const selectedId = typeof s === 'string' ? (isNaN(parseInt(s, 10)) ? s : parseInt(s, 10)) : s;
        return selectedId === optionId;
      });
    }
    // Single select - handle both null/undefined and the actual value
    if (selected === null || selected === undefined || selected === '') return false;
    // Direct comparison for strings, normalize numbers for numeric IDs
    if (typeof value === 'string' && typeof selected === 'string') {
      return selected === value;
    }
    const optionId = typeof value === 'string' ? (isNaN(parseInt(value, 10)) ? value : parseInt(value, 10)) : value;
    const selectedId = typeof selected === 'string' ? (isNaN(parseInt(selected, 10)) ? selected : parseInt(selected, 10)) : selected;
    return selectedId === optionId;
  };

  const handleSelect = (option) => {
    const value = option.id !== undefined ? option.id : option;
    // Keep original value (string or number) - don't normalize strings to numbers
    let newValue;
    
    if (allowMultiple) {
      const current = Array.isArray(selected) ? selected : (selected ? [selected] : []);
      
      if (isSelected(option)) {
        // Unselect
        if (allowUnselect) {
          // Remove by direct comparison (handles both strings and numbers)
          newValue = current.filter(v => {
            if (typeof v === 'string' && typeof value === 'string') {
              return v !== value;
            }
            // For numeric IDs, normalize both
            const vId = typeof v === 'string' ? (isNaN(parseInt(v, 10)) ? v : parseInt(v, 10)) : v;
            const valueId = typeof value === 'string' ? (isNaN(parseInt(value, 10)) ? value : parseInt(value, 10)) : value;
            return vId !== valueId;
          });
        } else {
          return; // Don't allow unselect
        }
      } else {
        // Select - add the value as-is (string or number)
        newValue = [...current, value];
      }
    } else {
      // Single select
      if (isSelected(option) && allowUnselect) {
        newValue = null;
      } else {
        newValue = value;
      }
    }
    
    // Always call onSelect to update state immediately
    onSelect(newValue, option);
  };

  const getDisplayName = (option) => {
    return option.name || option.label || String(option);
  };

  // Ensure options is an array
  const safeOptions = Array.isArray(options) ? options : [];

  console.log('SelectionSheet render:', {
    visible,
    title,
    optionsLength: safeOptions.length,
    firstOption: safeOptions[0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable 
          style={styles.overlayPressable} 
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome name="times" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options List */}
          <ScrollView
            style={styles.optionsList}
            contentContainerStyle={styles.optionsListContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {!safeOptions || safeOptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No options available</Text>
                <Text style={styles.emptyStateText}>Options count: {safeOptions.length}</Text>
              </View>
            ) : (
              safeOptions.map((option, index) => {
                if (!option) {
                  console.warn('Null option at index:', index);
                  return null;
                }
                const selected = isSelected(option);
                const displayName = getDisplayName(option);
                const optionKey = option.id ? String(option.id) : `option-${index}`;

                return (
                  <TouchableOpacity
                    key={optionKey}
                    style={styles.optionRow}
                    onPress={() => {
                      console.log('Option pressed:', displayName, 'value:', option.id || option);
                      handleSelect(option);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {displayName || 'Unnamed option'}
                    </Text>
                    {selected && (
                      <FontAwesome
                        name="check"
                        size={16}
                        color={COLORS.accent}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              }).filter(Boolean)
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 300,
    paddingTop: 20,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.accent,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionsListContent: {
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  optionTextSelected: {
    fontWeight: '500',
    color: COLORS.accent,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});

