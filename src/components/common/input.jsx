import * as React from "react";
import { cn } from "@/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upto-blue disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
