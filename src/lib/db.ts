
'use server';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { and, desc, eq } from 'drizzle-orm';
import * as schema from './db/schema';
import type { Influencer, Scene } from '@/types';
import { nanoid } from 'nanoid';

// This is a placeholder for session management. In a real app,
// you'd use a library like 'next-auth' or 'lucia-auth'.
// For this example, we'll assume a hardcoded user ID.
const getUserId = () => {
    // !! IMPORTANT !!
    // This is a placeholder. In a real application, you would get
    // the authenticated user's ID from a session.
    return 'placeholder_user_id';
};


const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema, logger: true });

// == Influencer Functions ==

export async function fetchInfluencers(): Promise<Influencer[]> {
  const userId = getUserId();
  const influencerList = await db.query.influencers.findMany({
    where: eq(schema.influencers.userId, userId),
    orderBy: [desc(schema.influencers.createdAt)],
  });
  return influencerList.map(i => ({...i, id: i.id as string})) as Influencer[];
}

export async function addInfluencer(influencer: Omit<Influencer, 'id'> & { id?: string | null }): Promise<Influencer> {
    const userId = getUserId();
    const { id, ...influencerData } = influencer;
    
    // Drizzle needs properties not in schema removed
    const { created_at, user_id, ...dataToSave } = influencerData;

    try {
        if (id) {
            await db.update(schema.influencers).set(dataToSave).where(and(eq(schema.influencers.id, id), eq(schema.influencers.userId, userId)));
            const updatedInfluencer = await db.query.influencers.findFirst({ where: eq(schema.influencers.id, id) });
            return updatedInfluencer as Influencer;
        } else {
            const newId = nanoid();
            const newInfluencer = {
                ...dataToSave,
                id: newId,
                userId: userId,
            };
            await db.insert(schema.influencers).values(newInfluencer);
            return { ...newInfluencer, id: newId };
        }
    } catch (error) {
        console.error('Erro ao adicionar/atualizar influenciador:', error);
        throw error;
    }
}


export async function deleteInfluencer(id: string): Promise<void> {
  const userId = getUserId();
  await db.delete(schema.influencers).where(and(eq(schema.influencers.id, id), eq(schema.influencers.userId, userId)));
}

// == Scene Functions ==

export async function fetchScenes(): Promise<Scene[]> {
  const userId = getUserId();
   const sceneList = await db.query.scenes.findMany({
    where: eq(schema.scenes.userId, userId),
    orderBy: [desc(schema.scenes.createdAt)],
  });
  return sceneList as Scene[];
}

export async function addScene(scene: Omit<Scene, 'id' | 'created_at'> & { id?: string | null }): Promise<Scene> {
    const userId = getUserId();
    const { id, ...sceneData } = scene;
    
    const { created_at, user_id, ...dataToSave } = sceneData;

    try {
        if (id) {
            await db.update(schema.scenes).set(dataToSave).where(and(eq(schema.scenes.id, id), eq(schema.scenes.userId, userId)));
            const updatedScene = await db.query.scenes.findFirst({ where: eq(schema.scenes.id, id) });
            return updatedScene as Scene;
        } else {
            const newId = nanoid();
            const newScene = {
                ...dataToSave,
                id: newId,
                userId: userId,
            };
            await db.insert(schema.scenes).values(newScene);
            return { ...newScene, id: newId };
        }
    } catch (error) {
        console.error('Erro ao adicionar/atualizar cena:', error);
        throw error;
    }
}

export async function deleteScene(id: string): Promise<void> {
  const userId = getUserId();
  await db.delete(schema.scenes).where(and(eq(schema.scenes.id, id), eq(schema.scenes.userId, userId)));
}
