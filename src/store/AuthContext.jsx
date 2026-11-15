import { createContext, useContext, useState, useEffect } from "react";
import { ACTION_TYPES, ROLES } from "@/constants";
import { courseApi } from "@/api/endpoints";
import { toast } from "sonner";

const AuthContext = createContext(null);

const defaultUser = {
  name: "Shailesh Chaudhari",
  email: "shailesh@uptoskills.com",
  phone: "+91 9876543210",
  location: "Mumbai, India",
  bio: "Aspiring software developer passionate about building web apps, AI algorithms, and cloud systems.",
  education: "B.Tech in Computer Science",
  xp: 17111,
  streak: 7,
  avatar: "SC",
  skills: [
    { name: "JavaScript", level: "Intermediate" },
    { name: "React", level: "Beginner" },
    { name: "Python", level: "Intermediate" }
  ],
  preferences: {
    pace: "Moderate",
    delivery: "Visual",
    dailyGoal: 2,
    timezone: "IST (UTC+5:30)"
  }
};

const defaultNotifications = [
  { id: 1, type: "update", title: "New Python quiz available", message: "A new intermediate Python quiz has been added to Python Sprint League.", time: "2 hours ago", read: false },
  { id: 2, type: "reminder", title: "Assignment Reminder", message: "Your React UI component challenge is due in 3 hours.", time: "5 hours ago", read: false },
  { id: 3, type: "announcement", title: "Global Hackathon 2026", message: "Sign up for the Uptoskills Summer Hackathon and win 5000 XP!", time: "1 day ago", read: true }
];

const defaultCertificates = [
  { id: "CERT-PY-8823", courseId: 1, title: "Python: The First Steps of a Developer", date: "May 12, 2026", mentor: "Sundar Pichai", verificationCode: "UPTO-PY-8823-XYZ" },
  { id: "CERT-COMM-2918", courseId: 4, title: "The Power of Communication", date: "June 02, 2026", mentor: "Oprah Winfrey", verificationCode: "UPTO-COMM-2918-ABC" }
];

const defaultForumPosts = [
  {
    id: 1,
    title: "How does the virtual DOM work in React?",
    author: "Kolluru Bindu",
    category: "Web Development",
    content: "I am trying to understand the difference between the Real DOM and Virtual DOM. Can anyone give a clear explanation with an example?",
    upvotes: 12,
    comments: [
      { author: "AI Mentor", content: "React keeps a lightweight representation of the DOM in memory. When state changes, it creates a new virtual DOM tree, compares it with the previous one (diffing), and updates only the changed parts in the real DOM (reconciliation)." },
      { author: "You", content: "That makes so much sense! It avoids the performance cost of full page repaints." }
    ],
    date: "June 14, 2026"
  },
  {
    id: 2,
    title: "Binary search vs Linear search",
    author: "Ashadapu Ashwitha",
    category: "Programming",
    content: "When is binary search worse than linear search? Is it only when the array is unsorted, or are there other cases?",
    upvotes: 8,
    comments: [
      { author: "Rahul Singh", content: "If the array is very small, the overhead of calculating the mid-point might make linear search slightly faster, but O(log N) is always superior for sorted lists." }
    ],
    date: "June 15, 2026"
  }
];

const defaultReviews = [
  { id: 1, courseId: 1, userName: "Priya Verma", rating: 5, comment: "Amazing course! Sundar Pichai's AI mentor explains concepts with high clarity.", date: "June 10, 2026" },
  { id: 2, courseId: 1, userName: "Aarav Sharma", rating: 4, comment: "Very good structure. Loved the quizzes at the end of each module.", date: "June 12, 2026" }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});
  const [theme, setTheme] = useState("dark");

  // Extended state
  const [wishlist, setWishlist] = useState([2, 3]);
  const [notifications, setNotifications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [forumPosts, setForumPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [supportMessages, setSupportMessages] = useState([
    { sender: "bot", text: "Hello! I am your Uptoskills AI Support Assistant. How can I help you today? You can ask me about courses, quizzes, certificates, or report technical issues.", time: "11:55 AM" }
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const mentor = localStorage.getItem("selectedMentor");
    const progress = localStorage.getItem("courseProgress");
    
    // Load state from localStorage only if authenticated
    if (stored && localStorage.getItem("auth") === "true") {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("auth");
      }
    } else {
      setUser(null);
    }
    
    if (mentor) setSelectedMentor(JSON.parse(mentor));
    if (progress) setCourseProgress(JSON.parse(progress));
    
    setTheme(localStorage.getItem("theme") || "dark");

    const w = localStorage.getItem("wishlist");
    if (w) setWishlist(JSON.parse(w));
    
    const n = localStorage.getItem("notifications");
    setNotifications(n ? JSON.parse(n) : defaultNotifications);

    const c = localStorage.getItem("certificates");
    setCertificates(c ? JSON.parse(c) : defaultCertificates);

    const qa = localStorage.getItem("quizAttempts");
    if (qa) setQuizAttempts(JSON.parse(qa));

    const fp = localStorage.getItem("forumPosts");
    setForumPosts(fp ? JSON.parse(fp) : defaultForumPosts);

    const r = localStorage.getItem("reviews");
    setReviews(r ? JSON.parse(r) : defaultReviews);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync utilities
  const saveState = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("auth", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const register = (userData, token) => {
    login(userData, token);
  };

  const selectMentor = (mentor) => {
    setSelectedMentor(mentor);
    localStorage.setItem("selectedMentor", JSON.stringify(mentor));
  };

  const updateProgress = (courseId, progress) => {
    const updated = { ...courseProgress, [courseId]: progress };
    setCourseProgress(updated);
    localStorage.setItem("courseProgress", JSON.stringify(updated));

    // If progress reaches 100%, award certificate
    if (progress === 100) {
      const exists = certificates.some((c) => c.courseId === Number(courseId));
      if (!exists) {
        const randId = `CERT-CR-${Math.floor(1000 + Math.random() * 9000)}`;
        const randCode = `UPTO-CR-${Math.floor(100000 + Math.random() * 900000)}`;
        const newCert = {
          id: randId,
          courseId: Number(courseId),
          title: courseId === 2 ? "Build a Billion Dollar Startup" : "Advanced Machine Learning with Python",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          mentor: courseId === 2 ? "Elon Musk" : "Jensen Huang",
          verificationCode: randCode
        };
        const updatedCerts = [newCert, ...certificates];
        saveState("certificates", updatedCerts, setCertificates);
        
        // Add notification
        const newNotif = {
          id: Date.now(),
          type: "update",
          title: "Certificate Earned!",
          message: `Congratulations! You've earned a certificate for completing your course.`,
          time: "Just now",
          read: false
        };
        saveState("notifications", [newNotif, ...notifications], setNotifications);
        toast.success("Congratulations! Certificate Earned!");
      }
    }
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  // Profile actions
  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    toast.success("Profile details updated successfully!");
  };

  // Wishlist actions
  const addToWishlist = (courseId) => {
    const id = Number(courseId);
    if (!wishlist.includes(id)) {
      const updated = [...wishlist, id];
      saveState("wishlist", updated, setWishlist);
      toast.success("Added to Saved Courses");
    }
  };

  const removeFromWishlist = (courseId) => {
    const id = Number(courseId);
    const updated = wishlist.filter((x) => x !== id);
    saveState("wishlist", updated, setWishlist);
    toast.success("Removed from Saved Courses");
  };

  const enrollCourse = (courseId) => {
    const id = Number(courseId);
    updateProgress(id, 0); // Initialize progress
    removeFromWishlist(id);
    
    // Sync with backend API
    courseApi.enroll(id).catch((err) => console.warn("Backend enroll sync:", err?.message));
    
    // Create notification
    const newNotif = {
      id: Date.now(),
      type: "update",
      title: "Enrolled in Course",
      message: `You have successfully enrolled in course #${id}. Ready to learn?`,
      time: "Just now",
      read: false
    };
    saveState("notifications", [newNotif, ...notifications], setNotifications);
    toast.success("Successfully enrolled in course!");
  };

  // Quiz actions
  const completeQuizPart = (leagueId, partId, score, maxQuestions, xpAward) => {
    const key = `${leagueId}-${partId}`;
    const previous = quizAttempts[key];
    
    // Update attempts
    const newAttempt = {
      leagueId,
      partId,
      score,
      maxQuestions,
      xpAward,
      timestamp: new Date().toISOString()
    };
    
    const updatedAttempts = { ...quizAttempts, [key]: newAttempt };
    saveState("quizAttempts", updatedAttempts, setQuizAttempts);

    // If it's a new attempt or score improved, award XP
    if (!previous || score > previous.score) {
      const diffXp = previous ? Math.round(((score - previous.score) / maxQuestions) * xpAward) : xpAward;
      if (diffXp > 0) {
        const updatedUser = { ...user, xp: (user.xp || 0) + diffXp };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }

    // Generate notifications
    const newNotif = {
      id: Date.now(),
      type: "update",
      title: `Completed Quiz Part`,
      message: `You scored ${score}/${maxQuestions} and earned XP.`,
      time: "Just now",
      read: false
    };
    saveState("notifications", [newNotif, ...notifications], setNotifications);
  };

  // Forum actions
  const addForumPost = (postData) => {
    const newPost = {
      id: Date.now(),
      title: postData.title,
      author: user?.name || "You",
      category: postData.category,
      content: postData.content,
      upvotes: 0,
      comments: [],
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    };
    const updated = [newPost, ...forumPosts];
    saveState("forumPosts", updated, setForumPosts);
    toast.success("Discussion posted successfully!");
  };

  const addForumReply = (postId, replyText) => {
    const updated = forumPosts.map((p) => {
      if (p.id === Number(postId)) {
        return {
          ...p,
          comments: [...p.comments, { author: user?.name || "You", content: replyText }]
        };
      }
      return p;
    });
    saveState("forumPosts", updated, setForumPosts);
    toast.success("Reply posted!");
  };

  const upvoteForumPost = (postId) => {
    const updated = forumPosts.map((p) => {
      if (p.id === Number(postId)) {
        return { ...p, upvotes: p.upvotes + 1 };
      }
      return p;
    });
    saveState("forumPosts", updated, setForumPosts);
  };

  // Notifications actions
  const markNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveState("notifications", updated, setNotifications);
    toast.success("All notifications marked as read");
  };

  // Feedback actions
  const submitReview = (courseId, rating, comment) => {
    const newReview = {
      id: Date.now(),
      courseId: Number(courseId),
      userName: user?.name || "You",
      rating: Number(rating),
      comment,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    };
    const updated = [newReview, ...reviews];
    saveState("reviews", updated, setReviews);
    toast.success("Review submitted! Thank you for your feedback.");
  };

  // Support Chat actions
  const addSupportMessage = (text) => {
    const userMsg = { sender: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setSupportMessages((prev) => [...prev, userMsg]);

    // Simulate bot reply
    setTimeout(() => {
      let botResponse = "Thanks for your message! Our team is looking into this and will get back to you shortly.";
      
      const lower = text.toLowerCase();
      if (lower.includes("course") || lower.includes("enroll")) {
        botResponse = "To enroll in a course, visit the 'Course Catalog' tab, select a course, and click the 'Enroll' button. You can also save it to your wishlist first!";
      } else if (lower.includes("quiz") || lower.includes("xp") || lower.includes("league")) {
        botResponse = "Quizzes are available under 'My Leagues'. Select a league, complete the parts, and earn XP. Higher scores yield better badge rewards!";
      } else if (lower.includes("cert") || lower.includes("download")) {
        botResponse = "Certificates are unlocked when course progress reaches 100%. Go to the 'Certificates' tab to view, download, or verify your completion credentials.";
      } else if (lower.includes("hello") || lower.includes("hi")) {
        botResponse = "Hello! Hope you are having an amazing learning experience today. How can I support your journey?";
      }

      const botMsg = { sender: "bot", text: botResponse, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setSupportMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedMentor,
        courseProgress,
        isAuthenticated: Boolean(user && localStorage.getItem("auth") === "true"),
        login,
        logout,
        register,
        selectMentor,
        updateProgress,
        theme,
        toggleTheme,
        // Extended States
        wishlist,
        notifications,
        certificates,
        quizAttempts,
        forumPosts,
        reviews,
        supportMessages,
        // Extended Actions
        updateProfile,
        addToWishlist,
        removeFromWishlist,
        enrollCourse,
        completeQuizPart,
        addForumPost,
        addForumReply,
        upvoteForumPost,
        markNotificationsAsRead,
        submitReview,
        addSupportMessage,
        dispatch: (action) => {
          if (action.type === ACTION_TYPES.LOGOUT) logout();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

