import LessonChunk from "../models/LessonChunk.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

/**
 * Deterministic semantic hashing fallback for embeddings (64 dimensions)
 * Generates an L2-normalized vector based on token frequencies and n-grams.
 * Ensures consistent, offline, zero-network vector search for tests & local mode.
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "by",
  "is", "are", "was", "were", "be", "been", "this", "that", "these", "those",
  "it", "its", "of", "from", "as", "into", "can", "could", "should", "would",
  "i", "you", "he", "she", "we", "they", "my", "your", "our", "their", "what",
  "how", "why", "when", "where", "which", "who", "whom", "will", "just", "do",
]);

export const computeDeterministicEmbedding = (text, dimensions = 256) => {
  const vec = new Array(dimensions).fill(0);
  if (!text || typeof text !== "string") return vec;

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return vec;

  // Single word and bi-gram hashing
  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash * 31 + word.charCodeAt(c)) & 0x7fffffff;
    }
    vec[hash % dimensions] += 1.5;

    if (i < tokens.length - 1) {
      const bigram = `${word}_${tokens[i + 1]}`;
      let bHash = 0;
      for (let c = 0; c < bigram.length; c++) {
        bHash = (bHash * 37 + bigram.charCodeAt(c)) & 0x7fffffff;
      }
      vec[bHash % dimensions] += 2.0;
    }
  }

  // Normalize to unit vector (L2 norm)
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
};

/**
 * Generate embedding vector using Gemini text-embedding-004 when available,
 * with automatic fallback to deterministic semantic vector.
 */
export const getEmbedding = async (text, genAIClient = null) => {
  if (genAIClient && typeof genAIClient.getGenerativeModel === "function") {
    try {
      const model = genAIClient.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      if (result?.embedding?.values && Array.isArray(result.embedding.values)) {
        return normalizeVector(result.embedding.values);
      }
    } catch {
      // Fallback silently to deterministic embedding
    }
  }

  return computeDeterministicEmbedding(text, 256);
};

export const normalizeVector = (vec) => {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
};

export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const mag = Math.sqrt(normA) * Math.sqrt(normB);
  return mag === 0 ? 0 : dot / mag;
};

/**
 * Split text into chunks with size and overlap limits.
 */
export const splitIntoChunks = (text, maxChars = 320, overlap = 40) => {
  if (!text || !text.trim()) return [];
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return [clean];

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + maxChars, clean.length);
    // Break on sentence or word boundary if possible
    if (end < clean.length) {
      const lastPeriod = clean.lastIndexOf(". ", end);
      if (lastPeriod > start + 100) {
        end = lastPeriod + 1;
      } else {
        const lastSpace = clean.lastIndexOf(" ", end);
        if (lastSpace > start + 50) {
          end = lastSpace;
        }
      }
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    if (end >= clean.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
};

/**
 * Index all lessons of a course into LessonChunk documents.
 */
export const indexCourseLessonChunks = async (course, genAIClient = null) => {
  if (!course || !course.lessons || course.lessons.length === 0) {
    return [];
  }

  const courseId = course._id || course.id;
  const chunksToInsert = [];

  for (const lesson of course.lessons) {
    const lessonId = lesson._id || lesson.id;
    const lessonTitle = lesson.title || `Lesson ${lessonId}`;

    const contentSources = [
      { text: lesson.text, sectionTitle: "Core Teaching Text", type: "text" },
      { text: lesson.transcript, sectionTitle: "Lecture Transcript", type: "transcript" },
      { text: lesson.pdfNotes, sectionTitle: "Study Guide Notes", type: "pdfNotes" },
      { text: lesson.script, sectionTitle: "Lesson Script", type: "script" },
    ];

    for (const source of contentSources) {
      if (!source.text || !source.text.trim()) continue;

      const textChunks = splitIntoChunks(source.text);
      for (const chunkText of textChunks) {
        const embedding = await getEmbedding(chunkText, genAIClient);
        chunksToInsert.push({
          courseId,
          lessonId,
          lessonTitle,
          sectionTitle: source.sectionTitle,
          contentType: source.type,
          text: chunkText,
          tokenCount: Math.ceil(chunkText.length / 4),
          embedding,
        });
      }
    }
  }

  if (chunksToInsert.length > 0) {
    // Clean old chunks for this course to ensure freshness
    await LessonChunk.deleteMany({ courseId });
    const inserted = await LessonChunk.insertMany(chunksToInsert);
    return inserted;
  }

  return [];
};

/**
 * Retrieve top-k relevant chunks for the CURRENT course, returning citations and out-of-course detection.
 */
export const retrieveRelevantChunks = async ({
  courseId,
  query,
  topK = 3,
  minSimilarity = 0.22,
  genAIClient = null,
}) => {
  if (!courseId || !query || !query.trim()) {
    return { chunks: [], citations: [], isOutOfCourse: true, topScore: 0 };
  }

  // Find chunks belonging strictly to the current course
  let chunks = await LessonChunk.find({ courseId });

  // If no chunks indexed yet, attempt to find course and index on demand
  if (!chunks || chunks.length === 0) {
    const isOid =
      courseId instanceof mongoose.Types.ObjectId ||
      (typeof courseId === "string" && /^[0-9a-fA-F]{24}$/.test(courseId));
    const course = await Course.findOne(isOid ? { _id: courseId } : { id: Number(courseId) });

    if (course) {
      chunks = await indexCourseLessonChunks(course, genAIClient);
    }
  }

  if (!chunks || chunks.length === 0) {
    return { chunks: [], citations: [], isOutOfCourse: true, topScore: 0 };
  }

  const queryEmbedding = await getEmbedding(query, genAIClient);

  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  const scored = chunks.map((chunk) => {
    // 1. Dense vector similarity
    let similarity = 0;
    if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    }

    // 2. Lexical term matching
    const chunkFullText = `${chunk.lessonTitle} ${chunk.sectionTitle} ${chunk.text}`.toLowerCase();
    const docTokens = chunkFullText
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

    const docSet = new Set(docTokens);
    let termMatches = 0;
    for (const t of queryTokens) {
      if (docSet.has(t)) {
        termMatches += 1;
      } else {
        for (const d of docSet) {
          if (d.includes(t) || t.includes(d)) {
            termMatches += 0.75;
            break;
          }
        }
      }
    }

    const termScore = queryTokens.length === 0 ? 0 : termMatches / Math.sqrt(queryTokens.length);

    // If query has non-stopwords and ZERO matches against chunk, similarity is 0
    const finalScore =
      queryTokens.length > 0 && termMatches === 0
        ? 0
        : Math.max(similarity, termScore);

    return {
      chunk,
      similarity: finalScore,
      citation: `[Citation: ${chunk.lessonTitle} (${chunk.sectionTitle})]`,
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  const topMatches = scored.slice(0, topK);
  const bestScore = topMatches[0]?.similarity || 0;

  // If even the best match is below the similarity threshold, it's out of course syllabus
  if (bestScore < minSimilarity) {
    return {
      chunks: [],
      citations: [],
      isOutOfCourse: true,
      topScore: bestScore,
    };
  }

  const relevant = topMatches.filter((m) => m.similarity >= minSimilarity);
  const uniqueCitations = Array.from(new Set(relevant.map((r) => r.citation)));

  return {
    chunks: relevant.map((r) => ({
      lessonTitle: r.chunk.lessonTitle,
      sectionTitle: r.chunk.sectionTitle,
      contentType: r.chunk.contentType,
      text: r.chunk.text,
      similarity: r.similarity,
    })),
    citations: uniqueCitations,
    isOutOfCourse: false,
    topScore: bestScore,
  };
};
