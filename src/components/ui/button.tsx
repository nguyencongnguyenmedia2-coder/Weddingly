import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "champagne";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#8B5E5A] text-white hover:bg-[#724B47] shadow-sm focus-visible:ring-[#8B5E5A]",
      secondary:
        "bg-[#F5EFE7] text-[#2C2422] hover:bg-[#EADBCE] focus-visible:ring-[#D6BE91]",
      champagne:
        "bg-[#D6BE91] text-[#2C2422] hover:bg-[#B89E6C] hover:text-white shadow-sm focus-visible:ring-[#D6BE91]",
      outline:
        "border border-[#EADBCE] bg-transparent text-[#2C2422] hover:bg-[#F5EFE7] dark:text-[#F5EFE7] dark:border-[#3A302E] dark:hover:bg-[#2A2321]",
      ghost:
        "bg-transparent text-[#2C2422] hover:bg-[#F5EFE7] dark:text-[#F5EFE7] dark:hover:bg-[#2A2321]",
      danger:
        "bg-[#B44A4A] text-white hover:bg-[#963C3C] focus-visible:ring-[#B44A4A]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-[10px] gap-1.5",
      md: "h-10 px-4 text-sm rounded-[12px] gap-2",
      lg: "h-12 px-6 text-base rounded-[16px] gap-2.5",
      icon: "h-10 w-10 rounded-[12px] p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
