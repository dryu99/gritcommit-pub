import { cn } from "@/ui/classnames";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "text-sm inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-brand text-white hover:bg-brandHover";

    return (
      <button
        className={cn(
          "focus-visible:ring-ring ring-offset-background inline-flex items-center justify-center rounded-md bg-brand text-sm font-medium text-white transition-colors hover:bg-brandHover " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
