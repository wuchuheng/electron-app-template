import { logger } from '../utils/logger';

/**
 * Seed the database with initial default data.
 * Add your own seed functions here as needed.
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding');

    // Add your seed functions here
    // Example:
    // await seedConfigTable();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error(`Database seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};