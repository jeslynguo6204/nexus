// mobile/features/profile/components/ProfileDetailsForm/sections/AboutSection.js
import React from 'react';
import { View, Text } from 'react-native';
import {
  FormSection,
  FormField,
  FormInput,
} from '@/features/profile/components/form-editor-components';
import { COLORS } from '@/styles/themeNEW';

function pad3(arr) {
  const a = Array.isArray(arr) ? arr.slice(0, 3) : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

export default function AboutSection({ draft, setField }) {
  const likes = pad3(draft.likes);
  const dislikes = pad3(draft.dislikes);

  const updateLike = (index, value) => {
    const next = [...likes];
    next[index] = value;
    setField('likes', next);
  };

  const updateDislike = (index, value) => {
    const next = [...dislikes];
    next[index] = value;
    setField('dislikes', next);
  };

  return (
    <FormSection title="About Me" first>
      <FormField label="Bio">
        <FormInput
          value={draft.bio}
          onChangeText={(v) => setField('bio', v)}
          placeholder="Say something about yourself"
          multiline
        />
      </FormField>

      <Text style={styles.subheading}>Likes</Text>
      <FormField label="Like #1" compact>
        <FormInput
          value={likes[0]}
          onChangeText={(v) => updateLike(0, v)}
          placeholder="e.g. Sushi"
        />
      </FormField>
      <FormField label="Like #2" compact>
        <FormInput
          value={likes[1]}
          onChangeText={(v) => updateLike(1, v)}
          placeholder="e.g. AirPods"
        />
      </FormField>
      <FormField label="Like #3" compact>
        <FormInput
          value={likes[2]}
          onChangeText={(v) => updateLike(2, v)}
          placeholder="e.g. Candlelit dinners"
        />
      </FormField>

      <Text style={styles.subheading}>Dislikes</Text>
      <FormField label="Dislike #1" compact>
        <FormInput
          value={dislikes[0]}
          onChangeText={(v) => updateDislike(0, v)}
          placeholder="e.g. Studying late"
        />
      </FormField>
      <FormField label="Dislike #2" compact>
        <FormInput
          value={dislikes[1]}
          onChangeText={(v) => updateDislike(1, v)}
          placeholder="e.g. Crowded buses"
        />
      </FormField>
      <FormField label="Dislike #3" compact>
        <FormInput
          value={dislikes[2]}
          onChangeText={(v) => updateDislike(2, v)}
          placeholder="e.g. Rainy days"
        />
      </FormField>
    </FormSection>
  );
}

const styles = {
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 6,
  },
};
