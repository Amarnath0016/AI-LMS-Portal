import { cn } from "@/utils";

export function Spinner({ size = "md", className }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-700 border-t-upto-blue",
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
