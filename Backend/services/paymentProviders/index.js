import { processDemoPayment } from "./demo.js";
import { processRazorpayPayment } from "./razorpay.js";

/**
 * Payment Provider Factory
 * Reads PAYMENT_MODE env (default: "demo") and returns the active processor.
 */
export const getPaymentProvider = () => {
  const mode = (process.env.PAYMENT_MODE || "demo").toLowerCase();

  if (mode === "razorpay") {
    return {
      mode: "razorpay",
      processPayment: processRazorpayPayment,
    };
  }

  return {
    mode: "demo",
    processPayment: processDemoPayment,
  };
};
