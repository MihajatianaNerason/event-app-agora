import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { LoginFormData } from "../types";

// Schéma de validation pour le formulaire de connexion
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Composant de formulaire de connexion réutilisable
 */
export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}

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
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}

        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      </div>

      <Button type="submit" className="w-full flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader size="sm" />
            <span className="text-muted-foreground">Loading ...</span>
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Se connecter
          </>
        )}
      </Button>

      <div className="mt-4 text-center">
        <Link to="/register" className="text-sm text-blue-600 hover:underline">
          Pas encore de compte ? S'inscrire
        </Link>
      </div>
    </form>
  );
}
