import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variantStyles = {
      default:
        "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-md hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/20 active:scale-95",
      ghost:
        "text-neutral-300 hover:text-white hover:bg-white/10 active:scale-95",
      outline:
        "border border-white/10 bg-transparent text-neutral-200 hover:bg-white/5 hover:border-white/20 active:scale-95",
      secondary:
        "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:scale-95",
    }[variant];

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    }[size];

    // Simple asChild support for rendering an anchor or child directly
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(baseStyles, variantStyles, sizeStyles, className, child.props.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
