import React from 'react';
import {
  EditProfileRow,
  RowTextInput,
} from '@/features/profile/components/form-editor-components';

function pad3(arr) {
  const a = Array.isArray(arr) ? arr.slice(0, 3) : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

export default function AboutSection({ draft, setField }) {
  const likes = pad3(draft.likes);
  const dislikes = pad3(draft.dislikes);

  const updateLike = (i, v) => {
    const next = [...likes];
    next[i] = v;
    setField('likes', next);
  };
  const updateDislike = (i, v) => {
    const next = [...dislikes];
    next[i] = v;
    setField('dislikes', next);
  };

  return (
    <>
      <EditProfileRow label="Bio" alignTop>
        <RowTextInput
          value={draft.bio}
          onChangeText={(v) => setField('bio', v)}
          placeholder="Say something about yourself"
          multiline
        />
      </EditProfileRow>
      <EditProfileRow label="Like #1">
        <RowTextInput
          value={likes[0]}
          onChangeText={(v) => updateLike(0, v)}
          placeholder="e.g. Sushi"
        />
      </EditProfileRow>
      <EditProfileRow label="Like #2">
        <RowTextInput
          value={likes[1]}
          onChangeText={(v) => updateLike(1, v)}
          placeholder="e.g. AirPods"
        />
      </EditProfileRow>
      <EditProfileRow label="Like #3">
        <RowTextInput
          value={likes[2]}
          onChangeText={(v) => updateLike(2, v)}
          placeholder="e.g. Candlelit dinners"
        />
      </EditProfileRow>
      <EditProfileRow label="Dislike #1">
        <RowTextInput
          value={dislikes[0]}
          onChangeText={(v) => updateDislike(0, v)}
          placeholder="e.g. Studying late"
        />
      </EditProfileRow>
      <EditProfileRow label="Dislike #2">
        <RowTextInput
          value={dislikes[1]}
          onChangeText={(v) => updateDislike(1, v)}
          placeholder="e.g. Crowded buses"
        />
      </EditProfileRow>
      <EditProfileRow label="Dislike #3">
        <RowTextInput
          value={dislikes[2]}
          onChangeText={(v) => updateDislike(2, v)}
          placeholder="e.g. Rainy days"
        />
      </EditProfileRow>
    </>
  );
}
