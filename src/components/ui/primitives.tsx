import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3.5 py-2 text-sm text-[#2C2422] transition-colors placeholder:text-[#A69591] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6BE91] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-[16px] border border-[#EADBCE] bg-white p-5 shadow-[0_4px_20px_-2px_rgba(44,36,34,0.05)] transition-all dark:bg-[#221C1B] dark:border-[#3A302E]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "champagne";
  children: React.ReactNode;
}) => {
  const styles = {
    default: "bg-[#F5EFE7] text-[#6B5E5B] border border-[#EADBCE]",
    success: "bg-[#EBF5F0] text-[#3F7D5A] border border-[#C2E3D0]",
    warning: "bg-[#FEF8EC] text-[#C68A27] border border-[#F6E1B6]",
    danger: "bg-[#FDF2F2] text-[#B44A4A] border border-[#F7CDCD]",
    champagne: "bg-[#F2E9DC] text-[#8B5E5A] border border-[#D6BE91]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
