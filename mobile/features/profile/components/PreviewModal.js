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
import { Modal, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../styles/ProfileFormStyles';

const PREVIEW_BG = '#1F6299';

export default function PreviewModal({ visible, onClose, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: PREVIEW_BG }}>
        {/* Close button — absolute top-right, no title */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: insets.top + 6,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#E9F4FF',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            elevation: 1000,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <FontAwesome name="close" size={18} color={COLORS.text} />
        </TouchableOpacity>

        {/* Card area — padding top to clear X, solid background behind */}
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 44,
            paddingHorizontal: 16,
            paddingBottom: 24 + insets.bottom,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
