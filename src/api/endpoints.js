import api from "./axios";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  verifyOtp: (payload) =>
    api.post("/auth/verify-otp", typeof payload === "object" ? payload : { otp: payload }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
  applyInstructor: (data) => api.post("/auth/apply-instructor", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/profile", data),
};

export const courseApi = {
  getAll: (params) => api.get("/courses", { params }),
  getById: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  updateProgress: (id, data) => api.patch(`/courses/${id}/progress`, data),
  create: (data) => api.post("/courses", data),
};

export const mentorApi = {
  getAll: () => api.get("/mentors"),
  getById: (id) => api.get(`/mentors/${id}`),
};

export const aiApi = {
  chat: (data) => api.post("/ai/chat", data),
  generateLecture: (data) => api.post("/ai/generate-lecture", data),
  evaluateCode: (data) => api.post("/ai/evaluate-code", data),
  getVoiceProfile: (mentorId) => api.get(`/ai/voice-profile/${mentorId}`),
  getAvatarConfig: (mentorId) => api.get(`/ai/avatar-config/${mentorId}`),
  synthesizeAudio: (data) => api.post("/ai/synthesize-audio", data),
};

export const quizApi = {
  get: (leagueId, partId) => api.get(`/quizzes/${leagueId}/${partId}`),
  submit: (data) => api.post("/quizzes/submit", data),
};

export const forumApi = {
  getAll: () => api.get("/forum"),
  create: (data) => api.post("/forum", data),
  addComment: (id, data) => api.post(`/forum/${id}/comments`, data),
  upvote: (id) => api.patch(`/forum/${id}/upvote`),
};

export const certificateApi = {
  getAll: () => api.get("/certificates"),
  verify: (code) => api.get(`/certificates/verify/${code}`),
};

export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  inviteUser: (data) => api.post("/admin/users/invite", data),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  approveCourse: (id) => api.patch(`/admin/courses/${id}/approve`),
  rejectCourse: (id) => api.patch(`/admin/courses/${id}/reject`),
  getAnalytics: () => api.get("/admin/analytics"),
  getInstructorApplications: () => api.get("/admin/instructor-applications"),
  approveInstructorApplication: (id) => api.patch(`/admin/instructor-applications/${id}/approve`),
  rejectInstructorApplication: (id, data) => api.patch(`/admin/instructor-applications/${id}/reject`, data),
};

export const instructorApi = {
  getDashboard: () => api.get("/instructor/dashboard"),
  getCourses: () => api.get("/instructor/courses"),
};
