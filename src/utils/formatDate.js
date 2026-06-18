export function formatDate(date, options = {}) {
  const defaults = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-IN", { ...defaults, ...options }).format(
    new Date(date),
  );
}
