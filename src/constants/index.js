export const API_URL = import.meta.env.VITE_API_URL || "https://api.uptoskills.com";

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
};

export const ACTION_TYPES = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
  SET_MENTOR: "SET_MENTOR",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
};

export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Leagues", to: "/courses" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Compete", to: "/courses" },
];
