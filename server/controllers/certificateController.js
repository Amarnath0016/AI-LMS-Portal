import Certificate from "../models/Certificate.js";

export const getUserCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    const cert = await Certificate.findOne({ verificationCode: code });

    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found or invalid code." });
    }

    return res.json({ success: true, verified: true, data: cert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
