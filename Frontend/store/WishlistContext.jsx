import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { wishlistApi } from "@/api/endpoints";
import { useAuthContext } from "./AuthContext";
import { toast } from "sonner";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, user } = useAuthContext();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist when authenticated
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await wishlistApi.getAll();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setWishlist(list);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load wishlist";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Set of wishlisted IDs (both string _id and numeric id)
  const wishlistIds = useMemo(() => {
    const ids = new Set();
    for (const c of wishlist) {
      if (c._id) ids.add(String(c._id));
      if (c.id !== undefined && c.id !== null) ids.add(String(c.id));
    }
    return ids;
  }, [wishlist]);

  const isWishlisted = useCallback(
    (courseOrId) => {
      if (!courseOrId) return false;
      if (typeof courseOrId === "object") {
        const id1 = courseOrId._id ? String(courseOrId._id) : null;
        const id2 = courseOrId.id !== undefined && courseOrId.id !== null ? String(courseOrId.id) : null;
        return (id1 && wishlistIds.has(id1)) || (id2 && wishlistIds.has(id2)) || false;
      }
      return wishlistIds.has(String(courseOrId));
    },
    [wishlistIds]
  );

  const addToWishlist = useCallback(
    async (course) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to save courses to your wishlist");
        return false;
      }
      const courseId = course._id || course.id;
      if (!courseId) return false;

      // Optimistic update
      const prevWishlist = [...wishlist];
      setWishlist((prev) => [course, ...prev.filter((c) => String(c._id || c.id) !== String(courseId))]);

      try {
        await wishlistApi.add(courseId);
        toast.success(`Saved "${course.title || "course"}" to your wishlist!`);
        fetchWishlist();
        return true;
      } catch (err) {
        setWishlist(prevWishlist);
        toast.error(err.response?.data?.message || "Failed to save course to wishlist");
        return false;
      }
    },
    [isAuthenticated, wishlist, fetchWishlist]
  );

  const removeFromWishlist = useCallback(
    async (course) => {
      if (!isAuthenticated) return false;
      const courseId = course._id || course.id || course;
      if (!courseId) return false;

      const courseTitle = course.title || "Course";

      // Optimistic update
      const prevWishlist = [...wishlist];
      setWishlist((prev) =>
        prev.filter((c) => String(c._id) !== String(courseId) && String(c.id) !== String(courseId))
      );

      try {
        await wishlistApi.remove(courseId);
        toast.success(`Removed "${courseTitle}" from wishlist`);
        fetchWishlist();
        return true;
      } catch (err) {
        setWishlist(prevWishlist);
        toast.error(err.response?.data?.message || "Failed to remove course from wishlist");
        return false;
      }
    },
    [isAuthenticated, wishlist, fetchWishlist]
  );

  const toggleWishlist = useCallback(
    async (course) => {
      if (!course) return false;
      if (isWishlisted(course)) {
        return await removeFromWishlist(course);
      } else {
        return await addToWishlist(course);
      }
    },
    [isWishlisted, removeFromWishlist, addToWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        wishlistCount: wishlist.length,
        loading,
        error,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refetchWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlist: [],
      wishlistIds: new Set(),
      wishlistCount: 0,
      loading: false,
      error: null,
      isWishlisted: () => false,
      addToWishlist: async () => false,
      removeFromWishlist: async () => false,
      toggleWishlist: async () => false,
      refetchWishlist: async () => {},
    };
  }
  return context;
}
