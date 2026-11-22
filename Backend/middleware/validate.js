import { ZodError } from "zod";

/**
 * Express middleware that validates req[source] (default: "body") against a Zod schema.
 * Returns consistent error format: { success: false, code: "VALIDATION_ERROR", message, errors }
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = (err.issues || []).map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        const primaryMessage = fieldErrors[0]?.message || "Validation failed for request body.";

        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: primaryMessage,
          errors: fieldErrors,
        });
      }

      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: err.message || "Invalid request payload format.",
      });
    }
  };
};

export default validate;
