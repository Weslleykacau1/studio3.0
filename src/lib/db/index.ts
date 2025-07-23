
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

// To prevent the database client from being initialized during the build process
// on Vercel, we'll use a "lazy" initialization approach.

let dbInstance: LibSQLDatabase<typeof schema> | null = null;
let clientInstance: Client | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set');
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is not set');
  }

  clientInstance = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
  });

  dbInstance = drizzle(clientInstance, { schema, logger: false }); // Set logger to false for production builds
  return dbInstance;
}

// We will use a getter for the db object instead of exporting it directly.
export const db = getDb();
