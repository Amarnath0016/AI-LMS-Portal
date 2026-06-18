import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-semibold text-[hsl(var(--foreground))]", className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
