import { HTMLAttributes, forwardRef } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Controls the max-width breakpoint. Defaults to 'xl'. */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "xl", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "mx-auto w-full px-6 md:px-8",
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";

export default Container;
