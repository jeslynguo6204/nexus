# App style guide (excl. login/signup)

Unified visuals for **Profile card**, **Matches/Chat**, and **Edit profile** — clean, minimal, Instagram-like.

## Tokens

- **Colors:** `themeNEW.js` → `COLORS` (background, surface, textPrimary, textMuted, accent, etc.).
- **Edit-profile rows:** `EditProfileStyles.js` → `EDIT_PROFILE` constants and `editProfileStyles` (row padding, label/value font sizes, avatar size, etc.).

## Typography

- **Headlines / row labels:** 16–18px, font weight 500–700, `COLORS.textPrimary`.
- **Body / values:** 16px, weight 400, `COLORS.textPrimary` or `COLORS.textMuted` for placeholders.
- **Meta / hints:** 13px, `COLORS.textMuted`.

## Layout patterns

### Top bar (Home, Likes, Chat, Profile)

- Left: 6° brand mark. Center: screen title or mode toggle. Right: settings or mode chip.
- Height ~50px, `marginTop: -6`. See `ChatStyles`, `HomeStyles`, `LikesStyles`.

### Edit profile

- **Header:** Back chevron | “Edit profile” (centered) | Save. Hairline divider below. `EditProfileStyles.header`.
- **Photo block:** Centered avatar (76px circle), then “Edit picture or avatar” link. `EditProfileStyles.photoBlock`.
- **Form rows:** Label left, value/control right. Hairline divider between rows. Use `EditProfileRow` + `RowTextInput` or selector (`value`/`placeholder`/`onPress`). Chips right-aligned via `chipsWrap`.

### Profile card (discover)

- `ProfileCardStyles.js`: card radius, photo area, caption overlay, expanded details. Uses `COLORS` from themeNEW.

## Spacing

- Row padding vertical: 14px (`EDIT_PROFILE.rowPaddingVertical`).
- Row padding horizontal: 16px.
- Section spacing: 8px where applicable.

## Components

- **EditProfileRow:** Label + optional control (inline input, chips) or selector (value + chevron). Use `alignTop` for multiline (e.g. Bio).
- **RowTextInput:** Minimal, right-aligned text input for rows (no box).
- **ChipRow:** Horizontal chips; use inside `EditProfileRow` with `chipsWrap` for right alignment.

## Do not use for login/signup

Auth screens use `theme.js` and `AuthStyles.js`; keep those separate from this guide.
