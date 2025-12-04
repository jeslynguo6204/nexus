// mobile/components/PreviewModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../styles/ProfileFormStyles';

export default function PreviewModal({ visible, title, onClose, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#1F6299' }}
        edges={['left', 'right', 'bottom']} // ⬅️ no top padding from SafeAreaView
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top,   // ⬅️ ONLY place we use the top inset
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#E5F2FF',
            }}
          >
            {title}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#E9F4FF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <FontAwesome name="close" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 24,
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
