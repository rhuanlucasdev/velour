import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    "bg-[#7C5CFF] text-white border-transparent",
    "hover:bg-[#6B4EE0] hover:shadow-[0_0_16px_rgba(124,92,255,0.35)]",
    "active:bg-[#5C40CC]",
  ].join(" "),
  ghost: [
    "bg-transparent text-white/50 border-transparent",
    "hover:bg-white/[0.05] hover:text-white/80",
    "active:bg-white/[0.08]",
  ].join(" "),
  outline: [
    "bg-[#121212] text-white/60 border-white/[0.08]",
    "hover:bg-white/[0.05] hover:text-white/85 hover:border-white/[0.14]",
    "active:bg-white/[0.08]",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-3 text-[12px] gap-1.5",
  md: "h-8 px-3.5 text-[13px] gap-2",
  lg: "h-9 px-4 text-[13.5px] gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "outline", size = "md", className = "", children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center font-medium rounded-md border",
          "transition-all duration-150 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]/50",
          "disabled:opacity-40 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
