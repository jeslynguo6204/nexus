// mobile/components/PreviewModal.js

/**
 * PreviewModal is a reusable modal component for displaying full-screen previews of
 * content, such as a user's profile. It is used in the ProfileScreen to allow users
 * to see how their profile will appear to others after editing.
 * 
 * The component takes a title and onClose function as props to configure the modal's
 * header, and it uses the children prop to render the content of the modal, which 
 * in the case of the ProfileScreen is a ProfileCard.
 * 
 * The PreviewModal provides a consistent, branded interface for presenting focused 
 * content to the user, with a fixed header featuring the title and a close button. 
 * The actual content is rendered in a scrollable area below the header, allowing 
 * for flexibility in what is displayed.
 * 
 * By leveraging the PreviewModal, the ProfileScreen (and potentially other screens 
 * in the app) can easily present users with a clean, immersive view of important 
 * content without needing to implement the surrounding modal interface each time.
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../styles/ProfileFormStyles';

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
