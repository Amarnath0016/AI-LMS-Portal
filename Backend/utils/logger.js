import pino from "pino";
import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : isTest ? "silent" : "debug"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.newPassword",
      "req.body.adminAccessCode",
      "req.body.cardNumber",
      "req.body.cvv",
      "req.body.expiry",
      "req.body.card",
      "cardNumber",
      "cvv",
      "expiry",
      "card",
      "password",
      "token",
      "accessToken",
      "refreshToken",
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "uptoskills-api",
    env: process.env.NODE_ENV || "development",
  },
});

/**
 * Request ID and structured request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const reqId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader("X-Request-Id", reqId);

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    if (res.statusCode >= 500) {
      logger.error(logData, `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} in ${durationMs}ms`);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} in ${durationMs}ms`);
    } else {
      logger.info(logData, `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} in ${durationMs}ms`);
    }
  });

  next();
};

export default logger;
