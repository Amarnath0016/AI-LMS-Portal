import { useState, useEffect, useCallback } from "react";

/**
 * Lightweight asynchronous query hook supporting loading, error, refetch, and empty states
 */
export function useApiQuery(apiFn, deps = [], options = {}) {
  const { initialData = undefined, enabled = true, transform = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn();
      const result = response.data?.data !== undefined ? response.data.data : response.data;
      const finalData = transform ? transform(result) : result;
      setData(finalData);
      return finalData;
    } catch (err) {
      if (
        err.response?.status === 402 ||
        err.response?.data?.code === "SUBSCRIPTION_REQUIRED"
      ) {
        const courseId = err.response?.data?.courseId;
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/subscribe")
        ) {
          const target = courseId ? `/subscribe?course=${courseId}` : "/subscribe";
          window.location.href = target;
        }
      }
      const msg = err.response?.data?.message || err.message || "Failed to load data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
    isEmpty: !loading && !error && (Array.isArray(data) ? data.length === 0 : data === null || data === undefined),
  };
}
