import { supabase } from '../supabase';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function generateToken(): string {
  return 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface BusinessOwner {
  id: string;
  business_id: string;
  email: string;
  session_token: string | null;
  created_at: string;
}

export interface BusinessOwnerWithData extends BusinessOwner {
  business: {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    category_slug: string;
    subscription_tier: string;
    cover_image_url: string | null;
    lat: number;
    lng: number;
    total_checkins: number;
    avg_rating: number;
  } | null;
}

export const registerBusinessOwner = async (
  email: string,
  password: string,
  businessData: {
    name: string;
    category_slug: string;
    description?: string;
    address?: string;
    lat: number;
    lng: number;
    subscription_tier: 'free' | 'basic' | 'featured';
  }
): Promise<{ owner: BusinessOwner | null; error?: string }> => {
  // Create business listing
  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .insert({
      name: businessData.name,
      category_slug: businessData.category_slug,
      description: businessData.description ?? null,
      address: businessData.address ?? null,
      lat: businessData.lat,
      lng: businessData.lng,
      subscription_tier: businessData.subscription_tier,
      is_approved: false,
      is_active: true,
    })
    .select('id')
    .single();

  if (bizErr || !biz) {
    return { owner: null, error: bizErr?.message ?? 'Failed to create business' };
  }

  // Create owner account
  const sessionToken = generateToken();
  const { data: owner, error: ownerErr } = await supabase
    .from('business_owners')
    .insert({
      business_id: biz.id,
      email,
      password_hash: simpleHash(password),
      session_token: sessionToken,
    })
    .select('id, business_id, email, session_token, created_at')
    .single();

  if (ownerErr || !owner) {
    // Cleanup business if owner creation fails
    await supabase.from('businesses').delete().eq('id', biz.id);
    return { owner: null, error: ownerErr?.message ?? 'Failed to create owner account' };
  }

  // Save session to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('biz_session', JSON.stringify({ token: sessionToken, businessId: biz.id }));
  }

  return { owner: owner as unknown as BusinessOwner };
};

export const loginBusinessOwner = async (
  email: string,
  password: string
): Promise<{ owner: BusinessOwnerWithData | null; error?: string }> => {
  const hash = simpleHash(password);
  const { data, error } = await supabase
    .from('business_owners')
    .select('*')
    .eq('email', email)
    .eq('password_hash', hash)
    .single();

  if (error || !data) {
    return { owner: null, error: 'Invalid email or password' };
  }

  // Generate new session token
  const sessionToken = generateToken();
  await supabase
    .from('business_owners')
    .update({ session_token: sessionToken })
    .eq('id', data.id);

  // Save session
  if (typeof window !== 'undefined') {
    localStorage.setItem('biz_session', JSON.stringify({ token: sessionToken, businessId: data.business_id }));
  }

  // Load business data
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, description, address, category_slug, subscription_tier, cover_image_url, lat, lng, total_checkins, avg_rating')
    .eq('id', data.business_id)
    .single();

  return {
    owner: {
      id: data.id,
      business_id: data.business_id,
      email: data.email,
      session_token: sessionToken,
      created_at: data.created_at,
      business: business as any,
    },
  };
};

export const getBusinessSession = async (): Promise<BusinessOwnerWithData | null> => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('biz_session');
  if (!raw) return null;
  try {
    const { token, businessId } = JSON.parse(raw);
    if (!token || !businessId) return null;

    const { data: owner } = await supabase
      .from('business_owners')
      .select('*')
      .eq('session_token', token)
      .eq('business_id', businessId)
      .single();

    if (!owner) {
      localStorage.removeItem('biz_session');
      return null;
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, description, address, category_slug, subscription_tier, cover_image_url, lat, lng, total_checkins, avg_rating')
      .eq('id', businessId)
      .single();

    return {
      id: owner.id,
      business_id: owner.business_id,
      email: owner.email,
      session_token: owner.session_token,
      created_at: owner.created_at,
      business: business as any,
    };
  } catch {
    localStorage.removeItem('biz_session');
    return null;
  }
};

export const logoutBusinessOwner = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('biz_session');
  }
};

export const createBusinessChallenge = async (
  businessId: string,
  challenge: { title: string; description?: string; xp_reward?: number }
) => {
  const { data, error } = await supabase
    .from('business_challenges')
    .insert({
      business_id: businessId,
      title: challenge.title,
      description: challenge.description ?? null,
      xp_reward: challenge.xp_reward ?? 100,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getBusinessChallenges = async (businessId: string) => {
  const { data } = await supabase
    .from('business_challenges')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return data ?? [];
};

export const deleteBusinessChallenge = async (challengeId: string) => {
  await supabase.from('business_challenges').delete().eq('id', challengeId);
};
