import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async ({ email, password }: FormData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Vérifier le rôle de l'utilisateur pour la redirection
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (accountError) {
        console.error("Erreur lors de la récupération du rôle:", accountError);
        // Si l'utilisateur est connecté mais n'a pas encore complété son profil
        navigate("/auth/register-email");
        return;
      }

      // Rediriger en fonction du rôle
      if (accountData.role === "organizer") {
        navigate("/organizer/profiles");
      } else {
        navigate("/user/profiles");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input type="email" placeholder="Email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
              <Input
                type="password"
                placeholder="Mot de passe"
                {...register("password")}
                className="mt-2"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
              {isError && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full flex items-center gap-2">
              {isPending ? (
                <Loader size={"sm"} />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Se connecter
            </Button>
          </form>
          <div className="mt-4 text-center">
            <a
              href="/register"
              className="text-sm text-blue-600 hover:underline"
            >
              Pas encore de compte ? S'inscrire
            </a>
          </div>
          <div className="my-4 text-center text-sm text-gray-500">ou</div>
          <Button variant="outline" className="w-full flex items-center gap-2">
            Se connecter avec Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
