import { supabase } from '../supabase';

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, user: data.user };
};

export const register = async (email: string, password: string, fullName: string, username: string) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } },
  });
  if (authError) return { success: false as const, error: authError.message };
  if (!authData.user) return { success: false as const, error: 'Registration failed' };

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    username,
    email: email.toLowerCase(),
    full_name: fullName,
    profile_image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
  });
  if (profileError) {
    return { success: false as const, error: profileError.message };
  }
  return { success: true as const, user: authData.user };
};

export const logout = async () => {
  await supabase.auth.signOut();
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const onAuthChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  }).data.subscription;
};
