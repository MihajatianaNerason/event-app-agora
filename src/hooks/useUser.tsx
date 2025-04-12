import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabaseClient";

interface UserProfile {
  id: string;
  full_name: string;
  image_url?: string;
  role: string;
}

export const useUsers = (userId: string | undefined) => {
  return useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      return data || [];
    },
    enabled: !!userId,
  });
};
