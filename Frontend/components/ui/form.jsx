import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/common/input";
import { Label } from "@/components/common/label";
import { cn } from "@/utils";

export function Field({ id, label, error, hint, className, ...props }) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn("mt-2", error && "border-red-500/70 focus-visible:ring-red-500")}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormMessage({ type = "success", children }) {
  const isSuccess = type === "success";
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        isSuccess
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300",
      )}
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
      <span>{children}</span>
    </div>
  );
}
