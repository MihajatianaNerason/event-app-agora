import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z
  .object({
    email: z
      .string()
      .min(1, { message: "L'email est requis" })
      .email({ message: "Email invalide" }),
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

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/register-email`,
        },
      });

      if (error) throw error;

      navigate("/auth/verify-email", { state: { email } });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-center">Inscription</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  {...register("confirmPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {isError && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full flex items-center gap-2">
              {isPending ? (
                <>
                  <Loader size={"sm"} />
                  <span className="text-muted">Loading ...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  S'inscrire avec Email
                </>
              )}
            </Button>
          </form>
          <div className="my-4 text-center text-sm text-gray-500">ou</div>
          <Button variant="outline" className="w-full flex items-center gap-2">
            S'inscrire avec Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
