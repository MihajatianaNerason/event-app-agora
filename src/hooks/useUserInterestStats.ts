import { supabase } from "@/utils/supabaseClient";
import { useQuery } from "@tanstack/react-query";

interface InterestStats {
  interest_count: number;
  no_interest_count: number;
}

export function useUserInterestStats(userId: number | undefined) {
  return useQuery({
    queryKey: ["userInterestStats", userId],
    queryFn: async (): Promise<InterestStats> => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase.rpc("get_user_interest_counts", {
        p_user_id: userId,
      });

      if (error) throw error;

      return {
        interest_count: Number(data[0].interest_count) || 0,
        no_interest_count: Number(data[0].no_interest_count) || 0,
      };
    },
    enabled: !!userId,
  });
}
