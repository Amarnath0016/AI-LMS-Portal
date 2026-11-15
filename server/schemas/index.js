import { z } from "zod";

// ==========================================
// 1. Authentication & Profile Schemas
// ==========================================
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.string().trim().email("Invalid email address format."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  role: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address format."),
  password: z.string().min(1, "Password is required."),
  adminAccessCode: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address format."),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address format."),
  otp: z.string().trim().min(6, "Verification OTP must be a 6-digit code."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  bio: z.string().max(500).optional(),
  education: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
  skills: z.array(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
});

// ==========================================
// 2. Course & Curriculum Schemas
// ==========================================
export const courseCreateSchema = z.object({
  title: z.string().trim().min(3, "Course title must be at least 3 characters long."),
  description: z.string().trim().min(10, "Description must be at least 10 characters long."),
  tag: z.string().trim().min(2, "Category tag is required."),
  league: z.string().trim().min(2, "League association is required."),
  mentorId: z.any().optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner").optional(),
  duration: z.string().optional(),
  price: z.number().nonnegative().optional().default(0),
  xp: z.number().int().positive().optional().default(1000),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export const moduleCreateSchema = z.object({
  title: z.string().trim().min(2, "Module title is required."),
  description: z.string().optional(),
  order: z.number().int().optional(),
});

export const moduleUpdateSchema = moduleCreateSchema.partial();

export const lessonCreateSchema = z.object({
  title: z.string().trim().min(2, "Lesson title is required."),
  duration: z.string().optional(),
  moduleId: z.any().optional(),
  moduleTitle: z.string().optional(),
  script: z.string().optional(),
  text: z.string().optional(),
  transcript: z.string().optional(),
  pdfNotes: z.string().optional(),
  videoUrl: z.string().optional(),
  order: z.number().int().optional(),
  quizQuestions: z.array(z.any()).optional(),
});

export const lessonUpdateSchema = lessonCreateSchema.partial();

export const courseEnrollSchema = z.object({
  paymentDetails: z.record(z.any()).optional(),
});

// ==========================================
// 3. Quiz Schemas
// ==========================================
export const quizSubmitSchema = z.object({
  leagueId: z.any().optional(),
  partId: z.any().optional(),
  answers: z.any(),
});

// ==========================================
// 4. Daily Challenge Schemas
// ==========================================
export const challengeRunSchema = z.object({
  code: z.string().min(1, "Code snippet is required for execution."),
  language: z.string().optional(),
});

export const challengeSubmitSchema = z.object({
  code: z.string().min(1, "Code solution is required for submission."),
  language: z.string().default("javascript").optional(),
});

// ==========================================
// 5. Community & Review Schemas
// ==========================================
export const createReviewSchema = z.object({
  courseId: z.any().optional(),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5."),
  comment: z.string().max(1000).optional(),
});

export const createForumPostSchema = z.object({
  title: z.string().trim().min(5, "Post title must be at least 5 characters long."),
  content: z.string().trim().min(10, "Post content must be at least 10 characters long."),
  category: z.string().default("General").optional(),
});
