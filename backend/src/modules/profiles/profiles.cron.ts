/**
 * Cron job to update ages for users whose birthday is today
 * This should be scheduled to run daily (e.g., at midnight)
 * 
 * Example usage with node-cron:
 * import cron from 'node-cron';
 * import { updateAgesForBirthdays } from './profiles.dao';
 * 
 * // Run daily at midnight
 * cron.schedule('0 0 * * *', async () => {
 *   try {
 *     const count = await updateAgesForBirthdays();
 *     console.log(`Updated ages for ${count} users with birthdays today`);
 *   } catch (error) {
 *     console.error('Error updating ages:', error);
 *   }
 * });
 */

import { updateAgesForBirthdays } from './profiles.dao';

/**
 * Manual function to update ages - can be called from an admin endpoint or cron job
 */
export async function runAgeUpdateJob(): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  try {
    const updatedCount = await updateAgesForBirthdays();
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error updating ages:', error);
    return { 
      success: false, 
      updatedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

