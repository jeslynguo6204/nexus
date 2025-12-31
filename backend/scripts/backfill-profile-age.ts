/**
 * Migration script to backfill date_of_birth, gender, and age for existing profiles
 * 
 * This script:
 * 1. Copies date_of_birth and gender from users table to profiles table
 * 2. Calculates age from date_of_birth for all profiles
 * 
 * Run with: npx ts-node backend/scripts/backfill-profile-age.ts
 */

import 'dotenv/config';
import { pool } from '../src/db/pool';

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

async function backfillProfileAge() {
  const client = await pool.connect();
  
  try {
    console.log('Starting profile age backfill...');
    
    await client.query('BEGIN');
    
    // Step 1: Copy date_of_birth and gender from users to profiles for existing profiles
    const updateFromUsers = await client.query(`
      UPDATE profiles p
      SET 
        date_of_birth = u.date_of_birth,
        gender = u.gender,
        updated_at = NOW()
      FROM users u
      WHERE p.user_id = u.id
        AND (p.date_of_birth IS NULL OR p.gender IS NULL)
        AND (u.date_of_birth IS NOT NULL OR u.gender IS NOT NULL)
      RETURNING p.user_id, p.date_of_birth, p.gender
    `);
    
    console.log(`Updated ${updateFromUsers.rowCount} profiles with date_of_birth and/or gender from users table`);
    
    // Step 2: Calculate and update age for all profiles that have date_of_birth
    const profilesWithDob = await client.query(`
      SELECT user_id, date_of_birth, age
      FROM profiles
      WHERE date_of_birth IS NOT NULL
    `);
    
    console.log(`Found ${profilesWithDob.rowCount} profiles with date_of_birth`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const row of profilesWithDob.rows) {
      const age = calculateAge(row.date_of_birth);
      
      if (age !== null && age > 0 && age < 150) {
        // Only update if age is different or null
        if (row.age !== age) {
          await client.query(
            `UPDATE profiles SET age = $1, updated_at = NOW() WHERE user_id = $2`,
            [age, row.user_id]
          );
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        console.warn(`Invalid age calculated for user_id ${row.user_id}: ${age} (date_of_birth: ${row.date_of_birth})`);
      }
    }
    
    console.log(`Updated age for ${updatedCount} profiles`);
    console.log(`Skipped ${skippedCount} profiles (age already correct)`);
    
    await client.query('COMMIT');
    
    console.log('✅ Profile age backfill completed successfully!');
    
    // Summary
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(date_of_birth) as profiles_with_dob,
        COUNT(gender) as profiles_with_gender,
        COUNT(age) as profiles_with_age
      FROM profiles
    `);
    
    console.log('\n📊 Summary:');
    console.log(`  Total profiles: ${summary.rows[0].total_profiles}`);
    console.log(`  Profiles with date_of_birth: ${summary.rows[0].profiles_with_dob}`);
    console.log(`  Profiles with gender: ${summary.rows[0].profiles_with_gender}`);
    console.log(`  Profiles with age: ${summary.rows[0].profiles_with_age}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during backfill:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
backfillProfileAge()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

