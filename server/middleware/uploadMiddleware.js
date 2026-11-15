import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Stored securely outside the web root (server/storage/lesson-materials)
export const LESSON_MATERIALS_DIR = path.resolve(__dirname, "../storage/lesson-materials");

if (!fs.existsSync(LESSON_MATERIALS_DIR)) {
  fs.mkdirSync(LESSON_MATERIALS_DIR, { recursive: true });
}

// Whitelist safe educational and document file types
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/json",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".txt",
  ".md",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".json",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LESSON_MATERIALS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeHash = crypto.randomBytes(16).toString("hex");
    cb(null, `mat_${Date.now()}_${safeHash}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type "${file.mimetype || ext}". Allowed types: PDF, TXT, MD, DOC, DOCX, PPT, PPTX, ZIP, PNG, JPG, JSON.`
    );
    error.status = 400;
    cb(error, false);
  }
};

export const uploadLessonMaterial = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum size limit
    files: 5,
  },
  fileFilter,
});

export default uploadLessonMaterial;
