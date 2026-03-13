import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable the hover scale + shadow elevation effect. Defaults to true. */
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { hoverable = true, padding = "md", className = "", children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "rounded-xl border border-white/[0.06] bg-[#1C1C1C]",
          "transition-all duration-200 ease-out",
          hoverable
            ? "hover:scale-[1.015] hover:border-white/[0.10] hover:shadow-[0_8px_28px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]"
            : "",
          paddingClasses[padding],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
