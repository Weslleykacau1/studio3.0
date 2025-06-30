import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Influencer, Scene } from '@/types';

const DB_NAME = 'ScriptifyDB';
const DB_VERSION = 1;
const INFLUENCERS_STORE = 'influencers';
const SCENES_STORE = 'scenes';

interface ScriptifyDBSchema extends DBSchema {
  [INFLUENCERS_STORE]: {
    key: string;
    value: Influencer;
  };
  [SCENES_STORE]: {
    key: string;
    value: Scene;
  };
}

let dbPromise: Promise<IDBPDatabase<ScriptifyDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<ScriptifyDBSchema>> {
    if (typeof window === 'undefined') {
        // Return a promise that never resolves on the server to avoid build errors.
        return new Promise(() => {});
    }
    if (!dbPromise) {
        dbPromise = openDB<ScriptifyDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(INFLUENCERS_STORE)) {
                    db.createObjectStore(INFLUENCERS_STORE, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(SCENES_STORE)) {
                    db.createObjectStore(SCENES_STORE, { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}


// Influencer Functions
export async function getAllInfluencers(): Promise<Influencer[]> {
  const db = await getDb();
  return db.getAll(INFLUENCERS_STORE);
}

export async function saveInfluencer(influencer: Influencer): Promise<string> {
  const db = await getDb();
  return db.put(INFLUENCERS_STORE, influencer);
}

export async function deleteInfluencerDB(id: string): Promise<void> {
  const db = await getDb();
  return db.delete(INFLUENCERS_STORE, id);
}

// Scene Functions
export async function getAllScenes(): Promise<Scene[]> {
  const db = await getDb();
  return db.getAll(SCENES_STORE);
}

export async function saveScene(scene: Scene): Promise<string> {
  const db = await getDb();
  return db.put(SCENES_STORE, scene);
}

export async function deleteSceneDB(id: string): Promise<void> {
  const db = await getDb();
  return db.delete(SCENES_STORE, id);
}
