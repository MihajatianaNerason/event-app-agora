import { useUsers } from "@/hooks/useUser";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { cn } from "../lib/utils";
import { supabase } from "../utils/supabaseClient";
import { Button } from "./ui/button";

interface EventVotingProps {
  eventId: number | undefined;
  className?: string;
}

interface VoteStats {
  interests: number;
  no_interests: number;
}

type VoteType = "interested" | "not_interested" | null;

export function EventVoting({ eventId, className }: EventVotingProps) {
  const { data: session } = useSession();
  const userId = session?.session?.user?.id;
  const { data: user } = useUsers(userId);
  const [isLoading, setIsLoading] = useState(false);
  const [voteStats, setVoteStats] = useState<VoteStats>({
    interests: 0,
    no_interests: 0,
  });
  const [userVote, setUserVote] = useState<VoteType>(null);

  // Fonction pour charger les statistiques de vote
  const loadVoteStats = async () => {
    if (!eventId) return;
    try {
      // Récupérer le nombre de votes "interested"
      const { count: interestCount, error: interestError } = await supabase
        .from("user_interests")
        .select("*", { count: "exact" })
        .eq("event_id", eventId);

      // Récupérer le nombre de votes "not interested"
      const { count: noInterestCount, error: noInterestError } = await supabase
        .from("user_no_interests")
        .select("*", { count: "exact" })
        .eq("event_id", eventId);

      if (interestError || noInterestError)
        throw interestError || noInterestError;

      setVoteStats({
        interests: interestCount || 0,
        no_interests: noInterestCount || 0,
      });
    } catch (error) {
      console.error("Error loading vote stats:", error);
    }
  };

  // Fonction pour charger le vote de l'utilisateur
  const loadUserVote = async () => {
    if (!eventId || !user?.[0]?.id) return;
    try {
      // Vérifier si l'utilisateur a voté "interested"
      const { data: interestVote, error: interestError } = await supabase
        .from("user_interests")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user[0].id)
        .maybeSingle();

      if (interestError) throw interestError;

      // Vérifier si l'utilisateur a voté "not interested"
      const { data: noInterestVote, error: noInterestError } = await supabase
        .from("user_no_interests")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user[0].id)
        .maybeSingle();

      if (noInterestError) throw noInterestError;

      if (interestVote) {
        setUserVote("interested");
      } else if (noInterestVote) {
        setUserVote("not_interested");
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error("Error loading user vote:", error);
    }
  };

  // Charger les stats et le vote de l'utilisateur au montage du composant
  useEffect(() => {
    loadVoteStats();
    loadUserVote();
  }, [eventId, user]);

  // Souscription en temps réel pour mettre à jour les votes instantanément
  useEffect(() => {
    if (!eventId) return;

    // Souscription pour les votes "interested"
    const interestsSubscription = supabase
      .channel(`user_interests:event_id=eq.${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_interests",
        },
        () => {
          loadVoteStats();
        }
      )
      .subscribe();

    // Souscription pour les votes "not interested"
    const noInterestsSubscription = supabase
      .channel(`user_no_interests:event_id=eq.${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_no_interests",
        },
        () => {
          loadVoteStats();
        }
      )
      .subscribe();

    // Nettoyer les abonnements lors du démontage ou du changement d'eventId
    return () => {
      supabase.removeChannel(interestsSubscription);
      supabase.removeChannel(noInterestsSubscription);
    };
  }, [eventId]);

  const handleVote = async (type: "interested" | "not_interested") => {
    if (!eventId || !user?.[0]?.id || isLoading) return;

    setIsLoading(true);
    try {
      // Si l'utilisateur a déjà voté de cette façon, supprimer le vote
      if (userVote === type) {
        const table =
          type === "interested" ? "user_interests" : "user_no_interests";
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user[0].id);

        if (deleteError) throw deleteError;

        setUserVote(null);
      } else {
        // Si l'utilisateur avait voté autrement, le supprimer d'abord
        if (userVote) {
          const oldTable =
            userVote === "interested" ? "user_interests" : "user_no_interests";
          await supabase
            .from(oldTable)
            .delete()
            .eq("event_id", eventId)
            .eq("user_id", user[0].id);
        }

        // Ajouter le nouveau vote
        if (type === "interested") {
          const { error } = await supabase.rpc("incremente_vote_interest", {
            p_event_id: eventId,
            p_user_id: user[0].id,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.rpc("incremente_vote_no_interest", {
            p_eventid: eventId,
            p_userid: user[0].id,
          });
          if (error) throw error;
        }

        setUserVote(type);
      }
      // Recharger les statistiques après modification
      await loadVoteStats();
    } catch (error) {
      console.error("Error in handleVote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId || !eventId || !user) return null;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={() => handleVote("interested")}
        className={cn(
          "flex items-center gap-2",
          userVote === "interested" &&
            "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{voteStats.interests}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={() => handleVote("not_interested")}
        className={cn(
          "flex items-center gap-2",
          userVote === "not_interested" &&
            "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{voteStats.no_interests}</span>
      </Button>
    </div>
  );
}
