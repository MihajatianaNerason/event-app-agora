import { InputPassword } from "@/components/InputPassword";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/utils/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async ({ password }: FormData) => {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      navigate("/login", {
        state: {
          message: "Votre mot de passe a été réinitialisé avec succès",
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
            Réinitialiser votre mot de passe
          </h2>
          <p className="text-gray-600 text-sm text-center mb-6">
            Veuillez entrer votre nouveau mot de passe
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <InputPassword
                placeholder="Nouveau mot de passe"
                {...register("password")}
                error={errors.password?.message}
              />

              <InputPassword
                placeholder="Confirmer le mot de passe"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>

            {isError && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}

            <Button type="submit" className="w-full flex items-center gap-2">
              {isPending ? (
                <>
                  <Loader size={"sm"} />
                  <span className="text-muted">
                    Réinitialisation en cours...
                  </span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
