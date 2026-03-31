import { supabase } from "@/lib/supabaseClient";
import { ProfileSchema, UserRoleSchema } from "@/lib/validators";
import { z } from "zod";

export type Profile = z.infer<typeof ProfileSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export const userService = {
  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data as Profile;
  },

  /**
   * Update user profile
   */
  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating profile ${id}:`, error);
      throw new Error(error.message);
    }
    return data as Profile;
  },

  /**
   * Check if user has specific role
   */
  async hasRole(roles: UserRole[]): Promise<boolean> {
    const profile = await this.getCurrentProfile();
    if (!profile) return false;
    return roles.includes(profile.role);
  },

  /**
   * Get all user profiles (Admin only)
   */
  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching all profiles:', error);
      throw new Error(error.message);
    }
    return data as Profile[];
  }
};
