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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart, Calendar, Menu, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EventStats } from "../types";

type StatView = "global" | "events" | "trends";

function Stats() {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const { userStatus } = useAuth();
  const userProfile = useUserProfile();
  const [currentView, setCurrentView] = useState<StatView>("global");

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
  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];

  if (userStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userStatus === "signed-out") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">
          Veuillez vous connecter pour voir vos statistiques
        </p>
      </div>
    );
  }

  // Calcul des statistiques globales
  const totalEvents = eventStats.length;
  const totalResponses = eventStats.reduce(
    (acc, stat) => acc + stat.interests_count + stat.no_interests_count,
    0
  );
  const totalInterested = eventStats.reduce(
    (acc, stat) => acc + stat.interests_count,
    0
  );
  const averageInterestRate =
    totalResponses > 0
      ? ((totalInterested / totalResponses) * 100).toFixed(1)
      : "0";

  // Données pour le graphique des tendances
  const trendData = eventStats.map((stat) => ({
    name: stat.title,
    intéressés: stat.interests_count,
    nonIntéressés: stat.no_interests_count,
  }));

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
            <TrendingUp className="mr-2 h-4 w-4" />
            Vue d'ensemble
          </Button>
          <Button
            variant={currentView === "events" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("events")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Par Événement
          </Button>
          <Button
            variant={currentView === "trends" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("trends")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Tendances
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "global":
        return (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <Card className="p-6 ">
                <div className="flex items-center gap-4 ">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div className="">
                    <p className="text-sm text-muted-foreground">
                      Total Événements
                    </p>
                    <p className="text-2xl font-bold">{totalEvents}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Réponses
                    </p>
                    <p className="text-2xl font-bold">{totalResponses}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 ">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Taux d'intérêt
                    </p>
                    <p className="text-2xl font-bold">{averageInterestRate}%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Intéressés
                    </p>
                    <p className="text-2xl font-bold">{totalInterested}</p>
                  </div>
                </div>
              </Card>
            </div>

            {totalResponses > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Répartition globale
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Intéressés", value: totalInterested },
                          {
                            name: "Non Intéressés",
                            value: totalResponses - totalInterested,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="var(--chart-1)"
                        dataKey="value"
                      >
                        {[0, 1].map((entry, index) => (
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
              </Card>
            )}
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
                <Card key={stat.event_id} className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stat.start_date &&
                      format(new Date(stat.start_date), "PPP", { locale: fr })}
                  </p>
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
                                name: "Non Intéressés",
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
                            {[0, 1].map((entry, index) => (
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
                  <div className="mt-4 text-center space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Total Réponses:</span>{" "}
                      {stat.interests_count + stat.no_interests_count}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Taux d'intérêt:</span>{" "}
                      {stat.interests_count + stat.no_interests_count > 0
                        ? (
                            (stat.interests_count /
                              (stat.interests_count +
                                stat.no_interests_count)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "trends":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Tendances</h2>
            <Card className="p-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="intéressés" fill={COLORS[0]} />
                    <Bar dataKey="nonIntéressés" fill={COLORS[1]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
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
            <SidebarContent />
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
