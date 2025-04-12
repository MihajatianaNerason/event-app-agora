import { Button } from "@/components/ui/button";
import useAuth from "@/features/auth/useAuth";
import { BellIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { Navigate } from "react-router-dom";
export default function Home() {
  const { userStatus } = useAuth();

  if (userStatus === "signed-in") {
    return <Navigate to="/organizer/profiles" />;
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 px-6 md:px-20 space-y-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Simplifiez l&apos;accès aux{" "}
            <span className="text-primary">événements universitaires</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Agora est une plateforme intuitive permettant aux étudiants,
            enseignants et entreprises tech de découvrir, suivre et participer à
            des événements académiques en toute simplicité.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/register">Commencer</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/login">Se connecter</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir Agora ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg bg-background shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Prêt à rejoindre Agora ?</h2>
          <p className="text-xl text-muted-foreground">
            Connectez-vous dès maintenant et ne manquez plus aucun événement
            académique !
          </p>
          <Button size="lg" asChild>
            <a href="/register">Créer un compte</a>
          </Button>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Gestion des événements",
    description:
      "Créez, modifiez et suivez vos événements académiques en toute simplicité.",
    icon: CalendarIcon,
  },
  {
    title: "Notifications en temps réel",
    description:
      "Soyez informé lorsque de nouveaux événements sont ajoutés ou mis à jour.",
    icon: BellIcon,
  },
  {
    title: "Engagement interactif",
    description:
      "Exprimez votre intérêt pour un événement avec un simple clic sur 'Intéressant' ou 'Pas Intéressant'.",
    icon: UsersIcon,
  },
];
