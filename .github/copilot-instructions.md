<!-- Auto-generated: tailored Copilot instructions for this repo -->
# Copilot / AI Assistant Instructions — Nexus (backend)

This file summarizes the essential, discoverable patterns and workflows for the `backend/` service so AI coding agents can be productive quickly.

1) Big picture
- **What:** TypeScript Node + Express monolith that exposes an API for a student social app. The backend lives in `backend/`.
- **Entry points:** `src/server.ts` boots the HTTP server; `src/app.ts` wires middleware and mounts routers.
- **Modules:** Features are organized under `src/modules/<feature>/` with four concerns: `*.routes.ts`, `*.controller.ts`, `*.service.ts`, and `*.dao.ts`.

2) Common patterns & conventions
- **Routing:** Route files export a default `Router` and are mounted in `app.ts` (example: `app.use('/profiles', profileRoutes)`). Public routes (/auth) are mounted without auth; most other routes apply `authMiddleware` at the route level.
- **Controller → Service → DAO:** Controllers parse/validate request payloads, call service functions, and return JSON. Services contain business rules and call DAOs for DB access. DAOs perform SQL via `dbQuery` or explicit transactions using `pool.connect()`.
- **Error handling:** Controllers use try/catch and call `next(err)`. Services/DAOs throw Errors and often set `(err as any).statusCode` to control HTTP status. The global handler is `src/middleware/errorHandler.ts` (last middleware in `app.ts`).
- **Authentication:** `src/middleware/auth.ts` verifies a Bearer JWT (`Authorization: Bearer <token>`), sets `req.userId`, and returns 401 on failure. JWT secret is `config.jwtSecret`.
- **DB access:** `src/db/pool.ts` exports `pool` and `dbQuery<T>()` which returns typed row arrays. Transactions use `const client = await pool.connect(); await client.query('BEGIN')` then commit/rollback and `client.release()`.
- **Naming:** DAO return types are named `SomethingRow` (e.g., `UserRow`, `ProfileRow`). Service-level request shapes use plain objects or `interface` declarations in the service file.

3) Environment & runtime
- **Required env vars:** `DATABASE_URL`, `JWT_SECRET`. The code throws at startup if `DATABASE_URL` or `JWT_SECRET` are missing (see `src/config/env.ts`).
- **Dev run:** `cd backend && npm run dev` uses `ts-node-dev --respawn --transpile-only src/server.ts` (no build step in repo). `config.port` defaults to `4000`.
- **DB SSL note:** `db/pool.ts` sets SSL with `rejectUnauthorized: false` to support some managed DBs (e.g., RDS) in development — be careful when running against production DBs.

4) Quick implementation checklist for adding a new feature/module
- Create `src/modules/<feature>/{<feature>.routes.ts, <feature>.controller.ts, <feature>.service.ts, <feature>.dao.ts}`.
- In the route file export `default router` and mount routes like existing modules (see `auth.routes.ts` and `profiles.routes.ts`).
- Use `authMiddleware` for endpoints requiring auth (pattern: pass `AuthedRequest` to controller functions and check `req.userId`).
- DAOs should use `dbQuery<T>()` for simple queries. For multi-statement work, use `pool.connect()` and a transaction.
- Throw errors from services with `(err as any).statusCode = <HTTP_CODE>` for consumer-friendly responses.

5) Patterns to follow (concrete examples)
- Passwords: hashed with `bcrypt.hash(..., 10)` in `auth.service.ts` and compared with `bcrypt.compare`.
- Tokens: `jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' })`.
- Signup checks school domain via `findSchoolByDomain` (see `modules/schools/schools.dao.ts`) before creating a user.
- Create-with-defaults: `createUserWithDefaults` in `users.dao.ts` performs a transaction inserting `users`, `profiles`, and `settings`.

6) Development & debugging tips
- To run locally: set `DATABASE_URL` and `JWT_SECRET` (and optionally `PORT`) then `npm run dev` in `backend/`.
- Logs: server logs and unhandled errors are printed to stdout/stderr by `console.log` / `console.error` in `server.ts` and `errorHandler`.
- If DB connections fail, check `DATABASE_URL` and SSL handling in `src/db/pool.ts`.

7) What not to change lightly
- Global `errorHandler` behavior and the `authMiddleware` contract (`Authorization: Bearer ...` and `req.userId`) are relied on across modules.
- The `dbQuery<T>` generic helper signature and transactional pattern in `users.dao.ts` — keep the `BEGIN`/`COMMIT`/`ROLLBACK`/`release()` flow.

8) Where to look for more details
- App wiring: `src/app.ts` and `src/server.ts`
- Env: `src/config/env.ts`
- DB helpers: `src/db/pool.ts`
- Middleware: `src/middleware/auth.ts`, `src/middleware/errorHandler.ts`
- Example feature: `src/modules/{auth,profiles,users}` shows complete route → controller → service → dao flows.

If any of the above is unclear or you want more examples (e.g., how to add unit tests or OpenAPI specs), tell me which area to expand and I'll iterate.
