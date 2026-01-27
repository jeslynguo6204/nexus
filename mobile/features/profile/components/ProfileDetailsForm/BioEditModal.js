import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '@/styles/themeNEW';
import editProfileStyles from '@/styles/EditProfileStyles';

const BIO_MAX_LENGTH = 150;

export default function BioEditModal({
  visible,
  value,
  onDone,
  onClose,
}) {
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState(value ?? '');

  useEffect(() => {
    if (visible) setLocal(value ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync on open
  }, [visible]);

  const remaining = BIO_MAX_LENGTH - (local?.length ?? 0);

  const handleDone = () => {
    onDone(local.trim());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[editProfileStyles.container, { paddingTop: insets.top, flex: 1 }]}>
        <View style={editProfileStyles.header}>
          <TouchableOpacity
            style={editProfileStyles.headerBack}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="chevron-left" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={editProfileStyles.headerTitle}>Bio</Text>
          <TouchableOpacity
            style={editProfileStyles.headerSave}
            onPress={handleDone}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={editProfileStyles.headerDone}>Done</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={{ flex: 1, paddingBottom: 24 }}>
            <View style={editProfileStyles.bioInputWrap}>
              <TextInput
                value={local}
                onChangeText={(v) => setLocal(v.slice(0, BIO_MAX_LENGTH))}
                placeholder="Say something about yourself"
                placeholderTextColor={COLORS.textMuted}
                style={editProfileStyles.bioInput}
                multiline
                maxLength={BIO_MAX_LENGTH}
                textAlignVertical="top"
              />
              <Text style={editProfileStyles.bioCounter}>{remaining}</Text>
            </View>
            <Text style={editProfileStyles.bioHelper}>
              Your bio is visible to everyone on and off the app.{' '}
              <Text style={editProfileStyles.bioHelperLink} onPress={() => {}}>
                Learn more
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
