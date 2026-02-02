# Backend deployment troubleshooting: "Connection refused" on port 443

Use this when the app gets "Network request failed" and `curl https://sixdegrees.dev` returns **Connection refused** (nothing listening on port 443).

---

## Step 1: Confirm the problem

From your Mac terminal:

```bash
curl -v https://sixdegrees.dev/auth/check-email
```

- If you see **"Connection refused"** or **"Failed to connect... port 443"** → the server is not accepting HTTPS. Continue below.
- If you get any HTTP response (even 400/404/500) → the server is up; the issue is elsewhere (e.g. app URL or auth).

---

## Step 2: Identify where the backend is hosted

Check where `sixdegrees.dev` is deployed. Common options:

- **VPS / EC2 / your own server** (e.g. DigitalOcean, AWS EC2, Linode)
- **PaaS** (Heroku, Railway, Render, Fly.io, etc.)
- **Serverless** (AWS Lambda, Vercel, etc. – less common for a long‑running API)

You need: **deployment logs**, **ability to restart/redeploy**, and (for VPS) **SSH access** if possible.

---

## AWS Elastic Beanstalk – where to look

Your backend is on **AWS EC2 with Elastic Beanstalk**. Use this section first.

### How EB handles traffic

1. **HTTPS (443)** → Usually terminates at the **Application Load Balancer (ALB)** or on the instance. The ALB forwards to your instance(s) on **port 80** (HTTP) or **8080**.
2. **On each EC2 instance**, Elastic Beanstalk runs **nginx** as a reverse proxy. Nginx listens on port 80 and forwards to your **Node app**.
3. **Your Node app** must listen on **`process.env.PORT`** – EB sets this (often **8080**). Nginx proxies to that port.

So: **User → ALB (443) → Instance (80) → nginx → Node (PORT)**. If Node crashes or doesn’t listen on `PORT`, nginx gets connection refused and health checks fail.

### 1. Check environment health (AWS Console)

1. Open **AWS Console** → **Elastic Beanstalk** → your **application** → your **environment** (e.g. `sixdegrees-dev`).
2. On the environment dashboard, check **Health**:
   - **Green** = healthy; if curl still fails, the issue may be DNS, ALB, or SSL (e.g. sixdegrees.dev not pointing to the ALB).
   - **Red / Yellow / Grey** = unhealthy or degraded. Click the health indicator to see **Cause** (e.g. "Instance has failed the health check").
3. Check **Events** (left sidebar or top): look for failed deployments, **"Command failed"**, or **"Application deployment failed"**.

### 2. View logs (most important)

1. In the environment, go to **Logs** (left sidebar).
2. Click **Request Logs** → **Last 100 Lines** (or **Full Logs** for the full bundle).
3. Click **Download** and open the zip. Important files:
   - **`var/log/nodejs/nodejs.log`** or **`/var/log/web.stdout.log`** – your Node app stdout/stderr. Look for the **first error or stack trace** after startup.
   - **`var/log/nginx/error.log`** – nginx errors (e.g. "connection refused" to upstream = Node not running or wrong port).
   - **`var/log/eb-engine.log`** – deployment steps; shows if the deploy or hooks failed.

**What to look for in Node logs:**

- "Listening on port 8080" (or whatever PORT is) → app started.
- **Uncaught exception**, **Error:**, **EADDRINUSE**, **ECONNREFUSED** (to DB), or **missing env** → fix that and redeploy.

### 3. Confirm your app listens on `PORT`

Your server must bind to **`process.env.PORT`**, not a hardcoded port. In your backend (e.g. `server.ts` or `app.listen`):

- **Correct:** `app.listen(process.env.PORT || 4000, ...)`
- **Wrong (for EB):** `app.listen(4000, ...)` only – EB will set PORT=8080; if you ignore it, nginx can’t reach your app.

Check your backend’s main file (e.g. `backend/src/server.ts`) and ensure it uses `process.env.PORT`.

### 4. Environment variables

1. In EB: **Configuration** → **Software** → **Environment properties**.
2. Ensure all required vars are set (e.g. `DATABASE_URL`, `NODE_ENV`, JWT/secret vars). A missing or wrong var can cause the app to crash on startup.
3. After changing env vars, EB will restart the app; wait for health to go green.

### 5. SSL / HTTPS and “Connection refused”

- If **HTTPS** is at the **ALB**: ALB listens on 443; your instance listens on 80 (or 8080). So "connection refused on port 443" can mean:
  - **ALB not in front of sixdegrees.dev** – DNS for sixdegrees.dev must point to the ALB (CNAME or A record to ALB DNS name). If it points to the EC2 instance IP, and nothing on the instance listens on 443, you get connection refused.
  - **ALB not listening on 443** – In EC2 → Load Balancers → your ALB → Listeners. There should be a listener for **443** (HTTPS) with a certificate. If 443 is missing or the cert is wrong, fix there.
- If **HTTPS** is on the **instance** (nginx on 443): then nginx must be configured for SSL and listening on 443; check **`/var/log/nginx/error.log`** in the EB logs.

**Most common:** sixdegrees.dev should point to the **ALB**, and the ALB should have a **443 listener** with the cert for sixdegrees.dev. The instance only needs to accept HTTP from the ALB on port 80.

### 6. Rollback in Elastic Beanstalk

1. **Application** → **Application versions** (or from the environment: **Upload and deploy** / **Application versions**).
2. Find the **last known-good version** (before the mutuals merge).
3. In the environment, go to **Upload and deploy** (or **Deploy**). Select that **previous application version** and deploy.
4. Wait for the environment to go **Green**, then run:
   ```bash
   curl -v https://sixdegrees.dev/auth/check-email
   ```
   If this works after rollback, the problem is in the new code or config; re-apply mutuals in small steps and redeploy each time.

### 7. SSH into the instance (optional)

If you use the **EB CLI**:

```bash
eb ssh
```

Then on the instance:

```bash
# Is Node running? (EB often uses port 8080)
sudo lsof -i :8080

# Nginx status
sudo systemctl status nginx

# Recent app logs
sudo tail -100 /var/log/nodejs/nodejs.log
# or
sudo tail -100 /var/log/web.stdout.log
```

If you don’t use EB CLI, use **EC2 → Instances** → select the instance → **Connect** (Session Manager or SSH).

### Elastic Beanstalk quick checklist

- [ ] **Health** in EB console: Green? If Red/Yellow, open **Logs** → **Request Logs** → **Full Logs** and check `nodejs.log` / `web.stdout.log` for the first error.
- [ ] **Events**: Any "Command failed" or "Deployment failed"?
- [ ] **sixdegrees.dev DNS**: Points to the **ALB** (not the EC2 instance IP). ALB has a **443 listener** with the correct certificate.
- [ ] **App uses PORT**: Your backend already uses `process.env.PORT || 4000` in `config/env.ts` – good for EB.
- [ ] **Rollback**: Deploy a previous **Application version** in EB; if curl works after that, the issue is in the new deploy.

---

## Step 3: Check deployment logs

In your hosting dashboard (or CI/CD, e.g. GitHub Actions):

1. **Build logs**
   - Did the build finish successfully?
   - Any failed steps or missing env vars during build?

2. **Runtime / start logs**
   - Did the Node process start?
   - Look for your server’s “Listening on…” message (e.g. port 4000 or 8080).
   - Any **uncaught exception** or **crash** right after start?

3. **Recent changes**
   - You merged mutuals changes and redeployed. Compare the **last working deploy** vs **current deploy**:
     - Same Node version?
     - Same env vars (no missing or renamed vars)?
     - No new code that runs at startup and throws (e.g. in `app.ts` / `server.ts` or anything required at boot)?

**If the process crashes on startup:** the logs will usually show the stack trace. Fix that error (or revert the commit that introduced it) and redeploy.

---

## Step 4: Understand how traffic reaches your app

HTTPS (port 443) is usually handled in one of two ways:

### A) Reverse proxy (nginx, Caddy, etc.) in front of Node

- **Proxy** listens on 443 (HTTPS), terminates SSL, and forwards to Node (e.g. `http://localhost:4000`).
- **Node** listens only on 4000 (or similar); it does **not** listen on 443.

**Check:**

1. Is the proxy process running? (e.g. `sudo systemctl status nginx` or `sudo systemctl status caddy` on the server.)
2. Is the Node process running? (e.g. `pm2 list` or `systemctl status your-app`.)
3. Proxy config: does it listen on 443 and proxy to the correct Node port? (e.g. `proxy_pass http://127.0.0.1:4000`.)

If the proxy or Node isn’t running, start it (or fix what’s preventing it from starting). If you changed proxy config, restart the proxy after editing.

### B) Platform handles HTTPS (Heroku, Railway, Render, etc.)

- The platform listens on 443 and forwards to your app.
- Your app usually listens on the port given by the platform (e.g. `process.env.PORT`).

**Check:**

1. In the dashboard, does it say the release/deploy is **live** and **running**?
2. Logs: does your app log that it’s listening on the expected port?
3. If the platform shows “crashed” or “restarting”, use the logs from Step 3 to fix the crash.

---

## Step 5: If you have SSH access to the server

On the machine that serves `sixdegrees.dev`:

```bash
# Is anything listening on 443?
sudo lsof -i :443
# or
sudo netstat -tlnp | grep 443

# Is your Node app listening? (replace 4000 with your app port)
sudo lsof -i :4000

# Is nginx/caddy running?
sudo systemctl status nginx
# or
sudo systemctl status caddy
```

- If **nothing** is on 443: start (or fix) the reverse proxy, or fix the platform so it binds to 443.
- If **proxy** is on 443 but Node is not on 4000: start (or fix) the Node app and ensure it binds to the port the proxy uses.

---

## Step 6: Rollback to confirm it’s the deploy

To verify the issue is the **deployment/code**, not the host or DNS:

1. **Revert to the last known-good commit** (before the mutuals merge):
   - In your repo: `git log` to find the commit hash before the merge.
   - Deploy that commit (e.g. push a branch that has that commit, or redeploy that tag/revision in your PaaS).

2. **Redeploy** using the same process you normally use (e.g. push to `main`, or trigger deploy in Railway/Render/Heroku).

3. **Test again:**
   ```bash
   curl -v https://sixdegrees.dev/auth/check-email
   ```

- If **rollback works** (you get an HTTP response): the problem is in the **new code or new deploy config**. Re-apply mutuals changes in small steps and redeploy after each step to see what breaks it.
- If **rollback still gives connection refused**: the problem is likely **infra** (proxy down, platform issue, firewall, or deploy pipeline not actually updating the running process).

---

## Step 7: Common causes after a “working before merge” change

| Symptom | What to check |
|--------|----------------|
| Process crashes on startup | Deployment/runtime logs for the first exception. Often: missing env var, wrong DB URL, or require() of a file that throws. |
| Port already in use | Another process bound to 4000/443; stop it or change your app’s port. |
| Proxy not restarted | After deploy, restart nginx/caddy so it forwards to the new Node process. |
| Wrong port in app | App must listen on `process.env.PORT` if the platform sets it (e.g. PaaS). |
| Build uses wrong Node version | Ensure Node version in engine / Dockerfile / buildpack matches what your app needs. |

---

## Step 8: After the server is reachable again

1. **Confirm from terminal:**
   ```bash
   curl -v https://sixdegrees.dev/auth/check-email
   ```
   You should see an HTTP response (e.g. 400 with a body about missing fields), not “Connection refused”.

2. **Reload the app** on your phone/simulator; “Network request failed” should go away.

3. If you had **temporarily** changed iOS ATS or other app settings for debugging, revert them (we already reverted the Info.plist change).

---

## Quick checklist

- [ ] `curl -v https://sixdegrees.dev/auth/check-email` – still connection refused?
- [ ] Deployment logs: build success? process start? any crash?
- [ ] Reverse proxy (if used): running and proxying to Node?
- [ ] Node process: running and listening on the expected port?
- [ ] Rollback deploy: does reverting to pre-merge commit fix the problem?
- [ ] After fix: curl gets an HTTP response and the app loads without “Network request failed”.

If you tell me your hosting setup (e.g. “Railway”, “VPS with nginx”, “Heroku”), I can narrow this down to exact commands and where to look in the dashboard.
