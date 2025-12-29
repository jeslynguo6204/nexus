// mobile/styles/useAccent.js

import { COLORS } from './theme';

export const getAccentColors = (mode = 'dating') => {
  if (mode === 'friends') {
    return {
      primary: COLORS.accentFriend,
      hover: COLORS.accentFriendHover,
      pressed: COLORS.accentFriendPressed,
      soft: COLORS.accentFriendSoft,
      border: COLORS.accentFriendBorder,
    };
  }

  return {
    primary: COLORS.accent,
    hover: COLORS.accentHover,
    pressed: COLORS.accentPressed,
    soft: COLORS.accentSoft,
    border: COLORS.accentBorder,
  };
};

// const accent = getAccentColors(mode);