import api from "./axios";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
};

export const courseApi = {
  getAll: () => api.get("/courses"),
  getById: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
};

export const mentorApi = {
  getAll: () => api.get("/mentors"),
  getById: (id) => api.get(`/mentors/${id}`),
};

export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  approveCourse: (id) => api.patch(`/admin/courses/${id}/approve`),
  rejectCourse: (id) => api.patch(`/admin/courses/${id}/reject`),
};
