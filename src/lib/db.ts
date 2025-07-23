
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Influencer, Scene } from '@/types';

// Helper function to get the current user's ID from Firebase Auth
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    // This case should ideally be handled by UI logic (e.g., redirect to login)
    // but throwing an error here prevents unintended data access.
    throw new Error('Utilizador não autenticado.');
  }
  return user.uid;
};

// == Influencer Functions ==

export async function fetchInfluencers(): Promise<Influencer[]> {
  const userId = getUserId();
  const influencersCol = collection(db, 'influencers');
  const q = query(influencersCol, where('user_id', '==', userId), orderBy('created_at', 'desc'));
  const influencerSnapshot = await getDocs(q);
  const influencerList = influencerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
  return influencerList;
}

export async function addInfluencer(influencer: Omit<Influencer, 'id' | 'created_at'> & { id?: string | null }): Promise<Influencer> {
    const userId = getUserId();
    const { id, ...influencerData } = influencer;

    try {
        if (id) {
            // Update existing influencer
            const influencerDoc = doc(db, 'influencers', id);
            await updateDoc(influencerDoc, influencerData);
            return { ...influencer, id };
        } else {
            // Add new influencer
            const docRef = await addDoc(collection(db, 'influencers'), {
                ...influencerData,
                user_id: userId,
                created_at: serverTimestamp(),
            });
            return { ...influencer, id: docRef.id };
        }
    } catch (error) {
        console.error('Erro ao adicionar/atualizar influenciador:', error);
        throw error;
    }
}


export async function deleteInfluencer(id: string): Promise<void> {
  const influencerDoc = doc(db, 'influencers', id);
  await deleteDoc(influencerDoc);
}

// == Scene Functions ==

export async function fetchScenes(): Promise<Scene[]> {
  const userId = getUserId();
  const scenesCol = collection(db, 'scenes');
  const q = query(scenesCol, where('user_id', '==', userId), orderBy('created_at', 'desc'));
  const sceneSnapshot = await getDocs(q);
  const sceneList = sceneSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scene));
  return sceneList;
}

export async function addScene(scene: Omit<Scene, 'id' | 'created_at'> & { id?: string | null }): Promise<Scene> {
    const userId = getUserId();
    const { id, ...sceneData } = scene;

    try {
        if (id) {
            // Update existing scene
            const sceneDoc = doc(db, 'scenes', id);
            await updateDoc(sceneDoc, sceneData);
            return { ...scene, id };
        } else {
            // Add new scene
            const docRef = await addDoc(collection(db, 'scenes'), {
                ...sceneData,
                user_id: userId,
                created_at: serverTimestamp(),
            });
            return { ...scene, id: docRef.id };
        }
    } catch (error) {
        console.error('Erro ao adicionar/atualizar cena:', error);
        throw error;
    }
}

export async function deleteScene(id: string): Promise<void> {
  const sceneDoc = doc(db, 'scenes', id);
  await deleteDoc(sceneDoc);
}
