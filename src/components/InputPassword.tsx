import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { ComponentPropsWithoutRef, useState } from "react";

interface InputPasswordProps extends ComponentPropsWithoutRef<typeof Input> {
  error?: string;
}

export function InputPassword({ error, ...props }: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input type={showPassword ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
