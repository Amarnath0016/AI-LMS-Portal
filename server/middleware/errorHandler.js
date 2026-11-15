export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const errorCode =
    err.code ||
    (statusCode === 404
      ? "NOT_FOUND"
      : statusCode === 400
      ? "BAD_REQUEST"
      : statusCode === 401
      ? "UNAUTHORIZED"
      : statusCode === 403
      ? "FORBIDDEN"
      : "INTERNAL_ERROR");

  res.status(statusCode).json({
    success: false,
    code: errorCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
