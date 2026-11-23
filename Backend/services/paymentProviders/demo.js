import crypto from "crypto";

/**
 * Demo Payment Provider - Simulates instantaneous payment completion
 * Used strictly for portfolio demos and sandbox testing.
 */
export const processDemoPayment = async ({ plan, course, billingName, billingEmail }) => {
  const reference = "DEMO-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  return {
    success: true,
    paymentMode: "demo",
    demoReference: reference,
    amount: plan.price,
    currency: "INR",
    message: "Demo payment simulated and authorized successfully.",
    billingName,
    billingEmail,
  };
};
