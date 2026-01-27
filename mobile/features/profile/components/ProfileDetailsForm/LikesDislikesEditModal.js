import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '@/styles/themeNEW';
import editProfileStyles from '@/styles/EditProfileStyles';

function pad3(arr) {
  const a = Array.isArray(arr) ? arr.slice(0, 3) : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

const PLACEHOLDERS = {
  likes: ['e.g. Sushi', 'e.g. AirPods', 'e.g. Candlelit dinners'],
  dislikes: ['e.g. Studying late', 'e.g. Crowded buses', 'e.g. Rainy days'],
};

export default function LikesDislikesEditModal({
  visible,
  mode,
  values,
  onDone,
  onClose,
}) {
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState(() => pad3(values));

  useEffect(() => {
    if (visible) setLocal(pad3(values));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync on open; values omitted to avoid reset while typing
  }, [visible]);

  const title = mode === 'likes' ? 'Likes' : 'Dislikes';
  const placeholders = PLACEHOLDERS[mode] || PLACEHOLDERS.likes;

  const handleDone = () => {
    onDone(local);
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
          <Text style={editProfileStyles.headerTitle}>{title}</Text>
          <TouchableOpacity
            style={editProfileStyles.headerSave}
            onPress={handleDone}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={editProfileStyles.headerSaveText}>Done</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {[0, 1, 2].map((i) => (
              <View key={i}>
                <Text style={editProfileStyles.singleFieldLabel}>
                  {mode === 'likes' ? 'Like' : 'Dislike'} #{i + 1}
                </Text>
                <TextInput
                  value={local[i]}
                  onChangeText={(v) => {
                    const next = [...local];
                    next[i] = v;
                    setLocal(next);
                  }}
                  placeholder={placeholders[i]}
                  placeholderTextColor={COLORS.textMuted}
                  style={editProfileStyles.singleFieldInput}
                  returnKeyType="done"
                />
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
