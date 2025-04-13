import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EventStats } from "../types";

function Stats() {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const { userStatus } = useAuth();
  const userProfile = useUserProfile();

  useEffect(() => {
    const fetchEventStats = async () => {
      if (!userProfile.userId) return;

      const { data, error } = await supabase.rpc("get_user_event_stats", {
        p_user_id: userProfile.userId,
      });

      if (error) {
        console.error("Error fetching event stats:", error);
        return;
      }

      setEventStats(data || []);
    };

    fetchEventStats();
  }, [userProfile.userId]);

  // Utilisation des variables CSS de shadcn pour les couleurs
  const COLORS = ["var(--chart-1)", "var(--chart-2)"];

  if (userStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (userStatus === "signed-out") {
    return <div>Please sign in to view your event statistics</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Event Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventStats.map((stat) => (
          <Card key={stat.event_id} className="p-4">
            <h2 className="text-lg font-semibold mb-4">{stat.title}</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Intéressés", value: stat.interests_count },
                      {
                        name: "Pas Intéressés",
                        value: stat.no_interests_count,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="var(--chart-1)"
                    dataKey="value"
                  >
                    {[
                      { name: "Intéressés", value: stat.interests_count },
                      {
                        name: "Pas Intéressés",
                        value: stat.no_interests_count,
                      },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Total Réponses: {stat.interests_count + stat.no_interests_count}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Stats;
