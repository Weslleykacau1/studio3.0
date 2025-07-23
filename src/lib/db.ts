
'use client';

import { supabase } from './supabase';
import type { Influencer, Scene } from '@/types';

// Helper function to get the current user's ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // This case should ideally be handled by UI logic (e.g., redirect to login)
    // but throwing an error here prevents unintended data access.
    throw new Error('Utilizador não autenticado.');
  }
  return user.id;
};

// == Influencer Functions ==

export async function fetchInfluencers(): Promise<Influencer[]> {
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar influenciadores:', error);
    throw error;
  }
  return data || [];
}

export async function addInfluencer(influencer: Omit<Influencer, 'id'>): Promise<Influencer> {
  const userId = await getUserId();
  const influencerWithUser = { ...influencer, user_id: userId };

  // If the influencer has an ID, it's an update (upsert). Otherwise, it's an insert.
  const { data, error } = await supabase
    .from('influencers')
    .upsert(influencerWithUser, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar/atualizar influenciador:', error);
    throw error;
  }
  return data;
}

export async function deleteInfluencer(id: string): Promise<void> {
  const { error } = await supabase
    .from('influencers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao apagar influenciador:', error);
    throw error;
  }
}

// == Scene Functions ==

export async function fetchScenes(): Promise<Scene[]> {
  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar cenas:', error);
    throw error;
  }
  return data || [];
}

export async function addScene(scene: Omit<Scene, 'id'>): Promise<Scene> {
  const userId = await getUserId();
  const sceneWithUser = { ...scene, user_id: userId };

  const { data, error } = await supabase
    .from('scenes')
    .upsert(sceneWithUser, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar/atualizar cena:', error);
    throw error;
  }
  return data;
}

export async function deleteScene(id: string): Promise<void> {
  const { error } = await supabase
    .from('scenes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao apagar cena:', error);
    throw error;
  }
}
