import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import * as Entities from './entities';
import { seedDatabase } from './seed';
import { getPaths } from '../utils/path.util';

// Use require to ensure we get the constructor, avoiding ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sqlite3 = require('better-sqlite3');

const getDatabasePath = () => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    return 'dev.sqlite';
  }
  // In production, database must be in userData to be writable
  return getPaths().database;
};

let db: DataSource;

let isInitialized = false;
export const getIsInitialized = () => isInitialized;

export const initDB = async (): Promise<void> => {
  const dbPath = getDatabasePath();

  try {
    logger.info(`Initializing database connection at: ${dbPath}`);

    db = new DataSource({
      type: 'better-sqlite3',
      driver: sqlite3,
      database: dbPath,
      entities: Object.values(Entities),
      subscribers: [],
      synchronize: true,
      logging: false,
    });

    await db.initialize();
    isInitialized = true;
    logger.info(`Database connection established to ${dbPath}`);

    // Seed initial data
    await seedDatabase();
  } catch (error) {
    logger.error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export const getDataSource = () => {
  if (!db || !isInitialized) {
    throw new Error('Database not initialized. Call initialize() first.');
  }
  return db;
};
