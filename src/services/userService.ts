import { supabase } from "@/utils/supabaseClient";

export interface UpdateProfileData {
  full_name: string;
  image_url?: string;
}

export async function updateUserProfile(
  userId: number,
  data: UpdateProfileData
) {
  const { data: updatedUser, error } = await supabase
    .from("accounts")
    .update({
      full_name: data.full_name,
      image_url: data.image_url,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return updatedUser;
}
