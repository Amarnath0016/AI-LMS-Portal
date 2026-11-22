import Certificate from "../models/Certificate.js";
import User from "../models/User.js";

export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    // Ownership check: return only the current user's certificates
    const certs = await Certificate.find({
      $or: [{ userId }, { userId: String(userId) }, { userId: Number(userId) }],
    }).sort({ createdAt: -1 });

    return res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Verification code is required." });
    }

    const cert = await Certificate.findOne({
      verificationCode: { $regex: new RegExp(`^${code.trim()}$`, "i") },
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Certificate not found or invalid verification code.",
      });
    }

    let recipientName = "Verified Learner";
    if (cert.userId) {
      const user = await User.findById(cert.userId);
      if (user) recipientName = user.name;
    }

    return res.json({
      success: true,
      verified: true,
      data: {
        ...cert.toObject(),
        valid: true,
        recipientName,
        userName: recipientName,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
