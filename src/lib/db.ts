
'use server';

import { and, desc, eq } from 'drizzle-orm';
import * as schema from './db/schema';
import type { Influencer, Scene } from '@/types';
import { nanoid } from 'nanoid';
import { db } from './db/index';

// This is a placeholder for session management. In a real app,
// you'd use a library like 'next-auth' or 'lucia-auth'.
// For this example, we'll assume a hardcoded user ID.
const getUserId = () => {
    // !! IMPORTANT !!
    // This is a placeholder. In a real application, you would get
    // the authenticated user's ID from a session.
    return 'placeholder_user_id';
};

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
    const { id, created_at, user_id, ...influencerData } = influencer;

    try {
        if (id) {
            // Update existing influencer
            await db.update(schema.influencers).set(influencerData).where(and(eq(schema.influencers.id, id), eq(schema.influencers.userId, userId)));
            const updatedInfluencer = await db.query.influencers.findFirst({ where: eq(schema.influencers.id, id) });
            if (!updatedInfluencer) throw new Error("Falha ao encontrar o influenciador após a atualização.");
            return updatedInfluencer as Influencer;
        } else {
            // Create new influencer
            const newId = nanoid();
            const newInfluencer = {
                ...influencerData,
                id: newId,
                userId: userId,
                createdAt: new Date().toISOString(),
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
    const { id, created_at, user_id, ...sceneData } = scene;

    try {
        if (id) {
            // Update existing scene
            await db.update(schema.scenes).set(sceneData).where(and(eq(schema.scenes.id, id), eq(schema.scenes.userId, userId)));
            const updatedScene = await db.query.scenes.findFirst({ where: eq(schema.scenes.id, id) });
            if (!updatedScene) throw new Error("Falha ao encontrar a cena após a atualização.");
            return updatedScene as Scene;
        } else {
            // Create new scene
            const newId = nanoid();
            const newScene = {
                ...sceneData,
                id: newId,
                userId: userId,
                createdAt: new Date().toISOString(),
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
