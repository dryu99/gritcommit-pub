import { cn } from "@/ui/classnames";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const buttonStyle =
  "focus-visible:ring-ring ring-offset-background inline-flex items-center justify-center rounded-md bg-brand text-sm font-medium text-white transition-colors hover:bg-brandHover " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "default", size = "default", ...props },
    ref,
  ) => {
    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
    };

    return (
      <button
        className={cn(buttonStyle, sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
