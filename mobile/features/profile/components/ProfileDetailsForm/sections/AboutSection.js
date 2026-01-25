// mobile/features/profile/components/ProfileDetailsForm/sections/AboutSection.js
import React, { useEffect, useState } from 'react';
import {
  FormSection,
  FormField,
  FormInput,
} from '@/features/profile/components/form-editor-components';

export default function AboutSection({ draft, setField }) {
  // Local text state to avoid trimming while typing and space glitches
  const [likesText, setLikesText] = useState(() => (Array.isArray(draft.likes) ? draft.likes.join(', ') : ''));
  const [dislikesText, setDislikesText] = useState(() => (Array.isArray(draft.dislikes) ? draft.dislikes.join(', ') : ''));

  // Keep local state in sync if draft changes externally
  useEffect(() => {
    const next = Array.isArray(draft.likes) ? draft.likes.join(', ') : '';
    if (next !== likesText) setLikesText(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.likes]);

  useEffect(() => {
    const next = Array.isArray(draft.dislikes) ? draft.dislikes.join(', ') : '';
    if (next !== dislikesText) setDislikesText(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.dislikes]);

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

      <FormField label="Likes (up to 3)">
        <FormInput
          value={likesText}
          onChangeText={setLikesText}
          onBlur={() => {
            const items = String(likesText || '')
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
              .slice(0, 3);
            setField('likes', items);
          }}
          placeholder="e.g. Sushi, AirPods, Candlelit dinners"
        />
      </FormField>

      <FormField label="Dislikes (up to 3)">
        <FormInput
          value={dislikesText}
          onChangeText={setDislikesText}
          onBlur={() => {
            const items = String(dislikesText || '')
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
              .slice(0, 3);
            setField('dislikes', items);
          }}
          placeholder="e.g. Studying late, Crowded buses, Rainy days"
        />
      </FormField>

      {/* Keep prompts in draft only if you actually use it later; otherwise remove from draft + section
      <FormField label="Prompts">
        <FormInput
          value={draft.prompts || ''}
          onChangeText={(v) => setField('prompts', v)}
          placeholder="Answer prompts to help others get to know you"
          multiline
        />
      </FormField> */}
    </FormSection>
  );
}
