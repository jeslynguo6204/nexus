<!-- Auto-generated: tailored Copilot instructions for this repo -->
# Copilot / AI Assistant Instructions — Nexus (Full Stack)

This file summarizes essential patterns for the Nexus student social app: a TypeScript/Node Express backend + React Native (Expo) mobile frontend.

## 1) Big Picture Architecture

**Repo structure:**
- `backend/` → Express API (TypeScript), entry: `src/server.ts`
- `mobile/` → React Native (Expo), entry: `App.js`

**Backend architecture:** Module-based (`src/modules/<feature>/`), each with routes → controller → service → DAO layers.

**Mobile architecture:** Screens organized by feature (`features/<feature>/screens/`), central auth via `App.js` + `AsyncStorage`, tab-based navigation.

**Data flow:** Mobile → API calls (`mobile/api/*API.js`) → Backend Express routes → Service/DAO → PostgreSQL → Response → UI update.

---

## 2) Backend: Module Pattern (Critical)

Every backend feature lives in `src/modules/<feature>/` with four files:

- **`<feature>.routes.ts`** – Exports default `Router`. Mounted in `app.ts` via `app.use('/<feature>', routes)`. Public routes (auth) mount without middleware; others apply `authMiddleware`.
- **`<feature>.controller.ts`** – Parses/validates request body, calls service, returns JSON. Uses try/catch → `next(err)`.
- **`<feature>.service.ts`** – Business logic. Throws errors with `(err as any).statusCode = <HTTP_CODE>` for status control. Calls DAOs.
- **`<feature>.dao.ts`** – Direct DB access via `dbQuery<T>()` or transactions. Return types named `SomethingRow` (e.g., `ProfileRow`).

Example: Updating a profile calls `updateMyProfile(userId, input)` in service → `updateProfileByUserId(userId, updates)` in DAO → `await dbQuery<ProfileRow>(...)` → returns typed rows.

---

## 3) Authentication & Authorization

**Tokens:**
- Mobile stores JWT in `AsyncStorage.setItem('token', ...)`.
- Requests use `Authorization: Bearer <token>` header (see `mobile/api/*API.js`).
- Backend `src/middleware/authMiddleware.ts` decodes JWT, sets `req.userId`, or returns 401.

**Signup flow:**
1. Mobile calls `POST /auth/signup` with `{ email, password, fullName, dateOfBirth?, gender? }`.
2. Backend resolves school via email domain (see `auth.service.ts` + `schools.service.ts`).
3. Creates user + profile + settings in one transaction (`createUserWithDefaults` in `users.dao.ts`).
4. Returns `{ userId, token }`.

---

## 4) Mobile: Navigation & Auth State

**Root entry:** `App.js` checks `AsyncStorage` for token. If present → show `BottomTabs`; else → show `AuthStack`.

**Tab-based UI:** `navigation/BottomTabs.js` defines Home, Likes, Chat (with nested stack), Profile. Each tab renders a screen from `features/<feature>/screens/`.

**Chat stack:** Special case (nested navigator) because Chat needs a detail view for individual conversations.

**Token lifecycle:**
- After successful login/signup, `onSignedIn(token)` callback updates App.js state.
- On logout, `onSignOut()` clears AsyncStorage + resets navigation.

---

## 5) API Integration Pattern (Mobile ↔ Backend)

All mobile API calls in `mobile/api/*API.js`:

```javascript
// Example: profileAPI.js
export async function getMyProfile(token) {
  const res = await fetch(`${API_BASE}/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.profile;
}
```

**Base URL:** Defaults to `http://localhost:4000`; set via `Constants.expoConfig.extra.apiBaseUrl` or env variable.

**Error handling:** Catch thrown errors on the screen (e.g., `LoginScreen.js` shows toast), log for debugging.

---

## 6) Database & DAO Patterns

**Connection:** `src/db/pool.ts` exports `pool` (PostgreSQL client pool) and `dbQuery<T>()` helper.

**Simple queries:**
```typescript
const rows = await dbQuery<UserRow>(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

**Transactions:**
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO profiles ...');
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

**SSL note:** `rejectUnauthorized: false` for dev/RDS compatibility; ensure prod uses proper certs.

---

## 7) Environment & Runtime

**Backend:**
- Required: `DATABASE_URL` (PostgreSQL), `JWT_SECRET` (long random string).
- Optional: `PORT` (defaults 4000).
- Run: `cd backend && npm run dev` (ts-node-dev, auto-restart on changes).

**Mobile:**
- Run: `cd mobile && npm run start` (Expo CLI).
- iOS: `npm run ios`; Android: `npm run android`.
- Set `API_BASE_URL` env var for custom backend URL; Android emulator may need `10.0.2.2:4000`.

---

## 8) Validation & Error Responses

**Backend validation:** Controllers use Zod schemas (e.g., `src/validation/profilesSchema.ts`) before calling service.

**Error shape:** Services throw errors with status code attached. Global `errorHandler` catches and sends JSON:
```json
{ "error": "message", "details": { "fieldErrors": {...} } }
```

**Mobile error handling:** Catch fetch errors or `error` field in response JSON. Show user-friendly message.

---

## 9) Styling & Mobile UI Conventions

**Colors:** `mobile/styles/theme.js` defines `COLORS` (primary, background, text, muted, etc.).

**Typography:** Headlines 16–18px, body 16px, meta 13px. See `STYLE_GUIDE.md`.

**Edit profile layout:** Use `EditProfileRow` component + `RowTextInput` for forms. Hairline dividers between rows. Centered avatar + "Edit picture" link.

**Discovery feed:** `ProfileCardStyles.js` for card styling (radius, photo overlay, expanded details).

---

## 10) Critical Patterns Not to Break

- **Auth contract:** `Authorization: Bearer <token>` + `req.userId` in middleware. All protected routes depend on this.
- **Error flow:** Services throw → Controllers catch → `next(err)` → Global handler formats.
- **Module isolation:** DAOs don't know about HTTP; Services don't know about Express. Clear separation.
- **Token expiry:** `jwt.sign(..., { expiresIn: '7d' })`. Mobile handles 401 by clearing token + showing login.

---

## 11) Debugging Checklist

**Backend won't start?**
- Check `DATABASE_URL` and `JWT_SECRET` env vars.
- Check PostgreSQL connection + SSL settings in `pool.ts`.

**Mobile login fails?**
- Check `API_BASE_URL` (default `http://localhost:4000`; Android may need `10.0.2.2`).
- Verify backend is running: `curl http://localhost:4000/health`.
- Check console logs in Expo terminal.

**API request 401?**
- Verify token in `AsyncStorage` is valid (not expired).
- Check `Authorization` header format (`Bearer <token>`).

---

## 12) Key File References

**Backend core:**
- `src/app.ts` – Route mounting + middleware wiring
- `src/server.ts` – HTTP server startup + logging
- `src/config/env.ts` – Environment variable parsing
- `src/middleware/{authMiddleware, errorHandlerMiddleware}.ts` – Auth + error handling

**Backend examples:**
- `src/modules/auth/` – Signup, login, token generation
- `src/modules/profiles/` – Profile CRUD, discovery filtering
- `src/modules/feed/` – Feed fetching + ranking logic

**Mobile core:**
- `App.js` – Auth state + root navigation
- `navigation/{BottomTabs, AuthStack}.js` – Navigation structure
- `mobile/api/*API.js` – HTTP client helpers

**Mobile examples:**
- `features/auth/screens/{LoginScreen, SignupScreen}.js` – Auth UI
- `features/profile/screens/ProfileScreen.js` – Profile display + edit
- `styles/theme.js`, `STYLE_GUIDE.md` – Design tokens
