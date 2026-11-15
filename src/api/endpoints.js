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
  enroll: (id, data = {}) => api.post(`/courses/${id}/enroll`, data),
  updateProgress: (id, data) => api.patch(`/courses/${id}/progress`, data),
  create: (data) => api.post("/courses", data),
};

export const enrollmentApi = {
  getMyEnrollments: () => api.get("/me/enrollments"),
  completeLesson: (lessonId, data = {}) => api.post(`/lessons/${lessonId}/complete`, data),
  savePlaybackPosition: (lessonId, data) => api.post(`/lessons/${lessonId}/position`, data),
  getPlaybackPosition: (lessonId, courseId) =>
    api.get(`/lessons/${lessonId}/position`, { params: { courseId } }),
};

export const mentorApi = {
  getAll: () => api.get("/mentors"),
  getById: (id) => api.get(`/mentors/${id}`),
};

export const aiApi = {
  chat: (data) => api.post("/ai/chat", data),
  getLessonAudio: (lessonId, data = {}) => api.post(`/ai/lessons/${lessonId}/audio`, data),
  generateLecture: (data) => api.post("/ai/generate-lecture", data),
  getDrafts: (courseId) => api.get(`/ai/courses/${courseId}/drafts`),
  publishDraft: (draftId) => api.patch(`/ai/drafts/${draftId}/publish`),
  evaluateCode: (data) => api.post("/ai/evaluate-code", data),
  getVoiceProfile: (mentorId) => api.get(`/ai/voice-profile/${mentorId}`),
  getAvatarConfig: (mentorId) => api.get(`/ai/avatar-config/${mentorId}`),
  synthesizeAudio: (data) => api.post("/ai/synthesize-audio", data),
};

export const quizApi = {
  getLeagues: () => api.get("/quizzes/leagues"),
  getMyAttempts: () => api.get("/quizzes/my-attempts"),
  get: (leagueId, partId) => api.get(`/quizzes/${leagueId}/${partId}`),
  submit: (data) => api.post("/quizzes/submit", data),
  submitAttempt: (id, data) => api.post(`/quizzes/${id}/submit`, data),
};

export const forumApi = {
  getAll: (params) => api.get("/forum", { params }),
  getById: (id) => api.get(`/forum/${id}`),
  create: (data) => api.post("/forum", data),
  addComment: (id, data) => api.post(`/forum/${id}/comments`, data),
  upvote: (id) => api.patch(`/forum/${id}/upvote`),
  delete: (id) => api.delete(`/forum/${id}`),
};

export const certificateApi = {
  getAll: () => api.get("/certificates"),
  verify: (code) => api.get(`/certificates/verify/${code}`),
};

export const wishlistApi = {
  getAll: () => api.get("/wishlist"),
  add: (courseId) => api.post(`/wishlist/${courseId}`),
  remove: (courseId) => api.delete(`/wishlist/${courseId}`),
};

export const reviewApi = {
  getAll: (params) => api.get("/reviews", { params }),
  create: (courseId, data) => api.post(`/reviews/${courseId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const leaderboardApi = {
  get: () => api.get("/leaderboard"),
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
