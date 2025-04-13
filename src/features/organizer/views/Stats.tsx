import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/utils/supabaseClient";
import { Menu } from "lucide-react";
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

type StatView = "global" | "events";

function Stats() {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const { userStatus } = useAuth();
  const userProfile = useUserProfile();
  const [currentView, setCurrentView] = useState<StatView>("events");

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

  const SidebarContent = () => (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
        <div className="space-y-1">
          <Button
            variant={currentView === "global" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("global")}
          >
            Statistiques Globales
          </Button>
          <Button
            variant={currentView === "events" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("events")}
          >
            Statistiques par Événement
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "global":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Statistiques Globales</h2>
            <Card className="p-4">
              <p>Total des événements: {eventStats.length}</p>
              <p>
                Total des réponses:{" "}
                {eventStats.reduce(
                  (acc, stat) =>
                    acc + stat.interests_count + stat.no_interests_count,
                  0
                )}
              </p>
            </Card>
          </div>
        );
      case "events":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">
              Statistiques par Événement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventStats.map((stat) => (
                <Card key={stat.event_id} className="p-4">
                  <h2 className="text-lg font-semibold mb-4">{stat.title}</h2>
                  <div className="h-[250px]">
                    {stat.interests_count === 0 &&
                    stat.no_interests_count === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          Pas encore de votes pour cet événement
                        </p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Intéressés",
                                value: stat.interests_count,
                              },
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
                              {
                                name: "Intéressés",
                                value: stat.interests_count,
                              },
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
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Total Réponses:{" "}
                      {stat.interests_count + stat.no_interests_count}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        {/* Sidebar pour les écrans larges */}
        <div className="hidden md:block w-64">
          <div className="sticky top-16 border h-[calc(100vh-4rem)] rounded-lg">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
                <div className="space-y-1">
                  <Button
                    variant={currentView === "global" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentView("global")}
                  >
                    Statistiques Globales
                  </Button>
                  <Button
                    variant={currentView === "events" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentView("events")}
                  >
                    Statistiques par Événement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet pour mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="md:hidden fixed top-20 left-4 z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Stats;
