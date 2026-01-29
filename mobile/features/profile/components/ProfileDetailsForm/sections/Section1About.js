import React from 'react';
import { View } from 'react-native';
import {
  EditProfileRow,
  RowTextInput,
  ChipRow,
  EditProfileSectionHeader,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';
import LikesDislikesRow from '../LikesDislikesRow';

function pad3(arr) {
  const a = Array.isArray(arr) ? arr.slice(0, 3) : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-Binary', value: 'non-binary' },
];
const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Other'];
const SEXUALITY_OPTIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Prefer not to say',
];

function truncateBio(s, max = 40) {
  const t = (s || '').trim();
  if (!t) return '';
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + '…';
}

export default function Section1About({
  draft,
  setField,
  openSelectionSheet,
  onOpenBio,
  onOpenLikes,
  onOpenDislikes,
  first,
}) {
  const likes = pad3(draft.likes);
  const dislikes = pad3(draft.dislikes);
  const bioPreview = truncateBio(draft.bio);

  return (
    <>
      <EditProfileSectionHeader title="About you" first={first} />
      <EditProfileRow label="Name">
        <RowTextInput
          value={draft.displayName}
          onChangeText={(v) => setField('displayName', v)}
          placeholder="Your display name"
        />
      </EditProfileRow>
      <EditProfileRow label="Gender">
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.gender}
          onSelect={(v) => setField('gender', v)}
          wrap={false}
        />
      </EditProfileRow>
      <EditProfileRow label="Pronouns">
        <ChipRow
          options={PRONOUN_OPTIONS}
          selected={draft.pronouns}
          onSelect={(v) => setField('pronouns', v)}
          allowUnselect
          wrap={false}
        />
      </EditProfileRow>
      <EditProfileRow
        label="Sexuality"
        value={draft.sexuality}
        placeholder="Not selected"
        onPress={() =>
          openSelectionSheet({
            title: 'Sexuality',
            options: SEXUALITY_OPTIONS.map((x) => ({ id: x, name: x })),
            selected: draft.sexuality || null,
            allowMultiple: false,
            allowUnselect: true,
            onSelect: (value) => setField('sexuality', value || ''),
          })
        }
      />
      <EditProfileRow
        label="Bio"
        value={bioPreview}
        placeholder="Add a bio"
        onPress={onOpenBio}
      />
      <LikesDislikesRow label="Likes" items={likes} onPress={onOpenLikes} />
      <LikesDislikesRow label="Dislikes" items={dislikes} onPress={onOpenDislikes} />
    </>
  );
}
