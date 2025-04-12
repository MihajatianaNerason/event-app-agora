import { Card, CardContent } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

/**
 * Layout commun pour toutes les pages d'authentification
 * Fournit une présentation cohérente avec un titre et une carte au centre
 */
export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Composant de séparateur avec texte au milieu pour les pages d'authentification
 */
export function AuthDivider({ text = "ou" }: { text?: string }) {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-sm text-gray-500">{text}</span>
      </div>
    </div>
  );
}
