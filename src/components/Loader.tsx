import { cn } from "@/lib/utils";
import React from "react";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4 border-2",
      md: "w-6 h-6 border-2",
      lg: "w-8 h-8 border-3",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-muted-foreground border-t-transparent",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Loader.displayName = "Loader";

export { Loader };
