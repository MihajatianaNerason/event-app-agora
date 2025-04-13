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
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async ({ email }: FormData) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      navigate("/auth/verify-email", {
        state: {
          email,
          message: "Vérifiez votre email pour réinitialiser votre mot de passe",
        },
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Mot de passe oublié
          </h2>
          <p className="text-gray-600 text-sm text-center mb-6">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input type="email" placeholder="Email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {isError && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}

            <Button type="submit" className="w-full flex items-center gap-2">
              {isPending ? (
                <>
                  <Loader size={"sm"} />
                  <span className="text-muted">Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Envoyer le lien
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
