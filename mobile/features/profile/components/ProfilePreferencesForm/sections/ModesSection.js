// mobile/features/profile/components/ProfilePreferencesForm/sections/ModesSection.js
import React from 'react';
import { View, Text, Switch } from 'react-native';

import { COLORS } from '@/styles/themeNEW';
import { FormSection, FormField } from '@/features/profile/components/form-editor-components';

export default function ModesSection({ draft, setField }) {
  return (
    <FormSection title="Mode" first>
      <FormField label="Dating Mode" compact>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.backgroundSubtle,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 16, color: COLORS.textPrimary, fontWeight: '400', marginBottom: 4 }}>
              Dating Mode
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: '400', lineHeight: 18 }}>
              See and be seen by people looking to date
            </Text>
          </View>

          <Switch
            value={!!draft.isDatingEnabled}
            onValueChange={(v) => setField('isDatingEnabled', v)}
            trackColor={{ false: COLORS.divider, true: COLORS.textPrimary }}
            thumbColor={draft.isDatingEnabled ? '#555555' : '#CCCCCC'}
          />
        </View>
      </FormField>

      <FormField label="Friend Mode" compact>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.backgroundSubtle,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 16, color: COLORS.textPrimary, fontWeight: '400', marginBottom: 4 }}>
              Friend Mode
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: '400', lineHeight: 18 }}>
              See and be seen by people looking for friends
            </Text>
          </View>

          <Switch
            value={!!draft.isFriendsEnabled}
            onValueChange={(v) => setField('isFriendsEnabled', v)}
            trackColor={{ false: COLORS.divider, true: COLORS.textPrimary }}
            thumbColor={draft.isFriendsEnabled ? '#555555' : '#CCCCCC'}
          />
        </View>
      </FormField>
    </FormSection>
  );
}
