import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "votre adresse e-mail";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Mail className="h-16 w-16 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-center">
            Vérifiez votre e-mail
          </h2>
          <p className="text-center text-gray-600">
            Nous avons envoyé un lien de confirmation à{" "}
            <span className="font-medium">{email}</span>
          </p>
          <p className="text-center text-gray-600">
            Cliquez sur le lien dans l'e-mail pour compléter votre inscription.
            Après confirmation, vous serez redirigé pour compléter votre profil.
          </p>
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/auth/login")}
            >
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
