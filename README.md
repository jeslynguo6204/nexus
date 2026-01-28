# Six Degrees - Development Setup Guide

This guide will walk you through setting up and running the Six Degrees app locally.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **PostgreSQL** database (or access to a remote database)
- **Expo CLI** (for mobile development)
- **Xcode** (for iOS development on Mac)
- **Git**

## Project Structure

```
nexus/
├── backend/          # Node.js/Express backend API
├── mobile/          # React Native mobile app (Expo)
└── frontend/        # Web frontend (if applicable)
```

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secret-key-here-make-it-long-and-random
PORT=4000
COGNITO_USER_POOL_ID=[your-user-pool-id]
COGNITO_APP_CLIENT_ID=[your-app-client-id]
```

**Required Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing (use a long, random string)
- `COGNITO_USER_POOL_ID`: App's user pool id in AWS Cognito
- `COGNITO_APP_CLIENT_ID`: App's client id in AWS Cognito

**Optional Variables:**
- `PORT`: Server port (defaults to 4000 if not set)

### 4. Start the Backend Server

```bash
npm run dev
```

You should see output like:
```
==================================================
🚀 Starting Six Degrees Backend Server
==================================================

📊 Testing database connection...
✅ Database connected successfully
   PostgreSQL version: PostgreSQL 15.x
   Server time: 2024-01-01 12:00:00

🚀 Initializing Express app...
✅ Middleware configured (CORS, JSON parser, request logging)
✅ Health check endpoint: GET /health
✅ Auth routes registered: /auth/*
✅ Protected routes registered:
   - /users/*
   - /profiles/*
   - /photos/*
   - /feed/*
   - /affiliations/*

==================================================
✅ Server is running and ready!
==================================================
📍 Local access:    http://localhost:4000
🌍 Network access:   http://0.0.0.0:4000
📱 Mobile app:       Use your computer's IP address
🔍 Health check:    http://localhost:4000/health
==================================================
```

The server will automatically restart when you make code changes.

**To stop the server:** Press `Ctrl+C` in the terminal.

---

## Mobile App Setup

### 1. Navigate to Mobile Directory

```bash
cd mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Your Computer's IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
```

**On Linux:**
```bash
hostname -I | awk '{print $1}'
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

This will output something like: `10.102.194.167` or `192.168.1.100`

**Important:** Your IP address may change when you reconnect to Wi‑Fi. If the mobile app can't connect to the backend, check your IP address again.

### 4. Set Up Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_ADDRESS:4000
```

**Replace `YOUR_IP_ADDRESS` with the IP address you got from step 3.**

For example:
```env
EXPO_PUBLIC_API_BASE_URL=http://10.102.194.167:4000
```

**Note:** Make sure your computer and mobile device/emulator are on the **same Wi‑Fi network**.

### 5. Start the Expo Development Server

```bash
npx expo start -c
```

The `-c` flag clears the cache, which is helpful when environment variables change.

You should see the Expo DevTools open in your browser and a QR code in the terminal.

### 6. Run the App

**For iOS Simulator (Mac only):**
- Press `i` in the terminal, or
- Click "Run on iOS simulator" in the Expo DevTools

**For Android Emulator:**
- Press `a` in the terminal, or
- Click "Run on Android device/emulator" in the Expo DevTools

**For Physical Device:**
- Install the "Expo Go" app from the App Store (iOS) or Play Store (Android)
- Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)
- Make sure your phone is on the same Wi‑Fi network as your computer

---

## Running the Full Stack

To run both backend and mobile app:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Mobile:**
   ```bash
   cd mobile
   npx expo start -c
   ```

3. **In the mobile terminal, press `i` to launch iOS simulator**

---

## Troubleshooting

### Backend Issues

**"Port 4000 already in use"**
- Another process is using port 4000
- Find and kill the process:
  ```bash
  lsof -ti:4000 | xargs kill -9
  ```
- Or change the port in your `.env` file

**"Database connection failed"**
- Check your `DATABASE_URL` is correct
- Verify the database is running and accessible
- Check firewall settings if using a remote database

**"Missing required env var"**
- Make sure your `.env` file exists in the `backend/` directory
- Verify all required variables are set (see Backend Setup step 3)

### Mobile App Issues

**"Request timeout" or "Cannot connect to server"**
- **Check your IP address** - it may have changed:
  ```bash
  ipconfig getifaddr en0  # Mac
  ```
- **Update `.env` file** with the new IP address
- **Restart Expo** with `npx expo start -c`
- **Verify backend is running** - check the backend terminal
- **Check firewall** - your computer's firewall might be blocking port 4000
- **Same network** - ensure your phone/emulator and computer are on the same Wi‑Fi

**"EXPO_PUBLIC_API_BASE_URL is undefined"**
- Make sure `.env` file exists in `mobile/` directory
- Restart Expo with `-c` flag: `npx expo start -c`
- Environment variables starting with `EXPO_PUBLIC_` are required for Expo

**App shows old data or cached content**
- Clear Expo cache: `npx expo start -c`
- Restart the app completely (close and reopen)

### Network Issues

**Can't connect from physical device**
- Ensure both devices are on the same Wi‑Fi network
- Check your computer's firewall allows connections on port 4000
- Try accessing `http://YOUR_IP:4000/health` from your phone's browser
- If using a VPN, try disconnecting it

**IP address keeps changing**
- Consider setting a static IP on your router for your development machine
- Or create a script to automatically update the `.env` file

---

## Development Tips

### Backend

- The server auto-restarts on code changes (thanks to `ts-node-dev`)
- Check the console logs for request/response details
- Use the `/health` endpoint to verify the server is running: `http://localhost:4000/health`

### Mobile

- Shake your device (or press `Cmd+D` in simulator) to open the Expo developer menu
- Use `Cmd+R` (iOS) or `R+R` (Android) to reload the app
- Check the Expo DevTools in your browser for logs and debugging tools

### Environment Variables

- **Backend `.env`**: Contains database credentials and secrets (never commit this!)
- **Mobile `.env`**: Contains API base URL (this is safe to commit, but IP will vary per developer)

---

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && npm run dev` |
| Start mobile | `cd mobile && npx expo start -c` |
| Get IP address (Mac) | `ipconfig getifaddr en0` |
| Check if port is in use | `lsof -i :4000` |
| Kill process on port 4000 | `lsof -ti:4000 \| xargs kill -9` |
| Test backend health | `curl http://localhost:4000/health` |

---

## Need Help?

If you're stuck:
1. Check the console logs in both backend and mobile terminals
2. Verify all environment variables are set correctly
3. Ensure both backend and mobile are running
4. Check that your IP address matches in the mobile `.env` file
5. Verify you're on the same network (for physical devices)

Happy coding! 🚀

