import crypto from "crypto";
import mongoose from "mongoose";
import {
  Certificate,
  Enrollment,
  Course,
  Quiz,
  QuizAttempt,
  User,
  Mentor,
  Notification,
} from "../models/index.js";

const getCourseQuery = (id) => {
  if (!id) return { _id: null };
  if (id._id) return { _id: id._id };
  if (id instanceof mongoose.Types.ObjectId) return { _id: id };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const issueCertificateIfEligible = async (userId, courseIdentifier) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { eligible: false, reason: "User not found" };

    const course = await Course.findOne(getCourseQuery(courseIdentifier));
    if (!course) return { eligible: false, reason: "Course not found" };

    // 1. Check Course Progress
    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: course._id,
    });

    if (!enrollment || enrollment.progress < 100) {
      return {
        eligible: false,
        reason: `Course progress is ${enrollment?.progress || 0}%, must be 100% to earn certificate.`,
      };
    }

    // 2. Check Quizzes if any exist for this league/course
    const leagueNumber = Number(course.id || course.leagueId);
    let quizQuery = [];
    if (!isNaN(leagueNumber)) {
      quizQuery.push({ leagueId: leagueNumber });
    }
    const quizzes = quizQuery.length > 0 ? await Quiz.find({ $or: quizQuery }) : [];

    if (quizzes.length > 0) {
      for (const q of quizzes) {
        const attempt = await QuizAttempt.findOne({
          userId: user._id,
          leagueId: q.leagueId,
          partId: q.partId,
          passed: true,
        });

        if (!attempt) {
          return {
            eligible: false,
            reason: `Required quiz "${q.title}" must be passed to earn certificate.`,
          };
        }
      }
    }

    // 3. Check if certificate already exists
    const existing = await Certificate.findOne({
      userId: user._id,
      courseId: course._id,
    });

    if (existing) {
      return { eligible: true, alreadyIssued: true, certificate: existing };
    }

    // 4. Determine mentor name
    let mentorName = "AI Lead Mentor";
    if (course.mentorId) {
      const isOid =
        course.mentorId instanceof mongoose.Types.ObjectId ||
        (typeof course.mentorId === "string" && /^[0-9a-fA-F]{24}$/.test(course.mentorId));
      const mentorDoc = await Mentor.findOne(
        isOid ? { _id: course.mentorId } : { id: Number(course.mentorId) }
      );
      if (mentorDoc) mentorName = mentorDoc.name;
    }

    // 5. Generate unique verification code
    const tagPrefix = (course.tag || "CRS").slice(0, 3).toUpperCase();
    const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const verificationCode = `UPTO-${tagPrefix}-${Math.floor(1000 + Math.random() * 9000)}-${randHex}`;

    const newCertificate = await Certificate.create({
      id: `CERT-${tagPrefix}-${Date.now().toString().slice(-4)}`,
      userId: user._id,
      courseId: course._id,
      title: course.title,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      mentor: mentorName,
      verificationCode,
      grade: "A+",
      league: course.league || "Professional Track",
    });

    // 6. Notify user
    await Notification.create({
      userId: user._id,
      title: "Certificate Earned! 🏆",
      message: `Congratulations! You've officially graduated "${course.title}" with code ${verificationCode}.`,
      type: "achievement",
      link: "/certificates",
    });

    return { eligible: true, alreadyIssued: false, certificate: newCertificate };
  } catch (error) {
    console.error("[Certificate Error]", error.message);
    return { eligible: false, reason: error.message };
  }
};
