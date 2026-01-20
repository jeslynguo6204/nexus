# Age Update Setup

This document explains how to set up automatic age updates for user profiles.

## Overview

When a user creates an account, their `date_of_birth` and `gender` are automatically copied from the `users` table to the `profiles` table, and their `age` is calculated and stored.

The age is automatically updated on each user's birthday via a scheduled job.

## Automatic Age Calculation on Signup

When a new user signs up:
1. `date_of_birth` and `gender` are copied from `users` to `profiles`
2. `age` is calculated from `date_of_birth` and stored in `profiles`

This happens automatically in `createUserWithDefaults()` in `users.dao.ts`.

## Setting Up Daily Age Updates

You have two options for updating ages on birthdays:

### Option 1: Manual API Endpoint (for testing)

You can manually trigger age updates by calling:
```
POST /profiles/admin/update-ages
```

This will update ages for all users whose birthday is today.

**Note:** You may want to add admin authentication middleware to this endpoint for security.

### Option 2: Automated Cron Job (recommended)

To automatically update ages daily, you can use a cron job. Here are a few options:

#### Using node-cron (Node.js)

1. Install node-cron:
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

2. Add to `server.ts` or create a separate cron file:
```typescript
import cron from 'node-cron';
import { runAgeUpdateJob } from './modules/profiles/profiles.cron';

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily age update job...');
  const result = await runAgeUpdateJob();
  if (result.success) {
    console.log(`Updated ages for ${result.updatedCount} users`);
  } else {
    console.error('Age update failed:', result.error);
  }
});
```

#### Using System Cron (Linux/Mac)

Add to your crontab (`crontab -e`):
```
0 0 * * * curl -X POST http://localhost:YOUR_PORT/profiles/admin/update-ages
```

#### Using External Cron Service

You can use services like:
- **cron-job.org** - Free web-based cron service
- **EasyCron** - Another free cron service
- **AWS EventBridge** - If hosting on AWS
- **Google Cloud Scheduler** - If hosting on GCP

Simply set up a daily HTTP request to:
```
POST http://your-api-url/profiles/admin/update-ages
```

## Database Schema

Make sure your `profiles` table has these columns:
```sql
ALTER TABLE profiles
ADD COLUMN age INTEGER,
ADD COLUMN date_of_birth DATE;
```

## Testing

To test the age update manually:
1. Create a test user with a date_of_birth
2. Call `POST /profiles/admin/update-ages`
3. Check that the age was updated correctly

To test birthday updates:
1. Temporarily change a user's `date_of_birth` to today's date
2. Run the update job
3. Verify the age was recalculated

