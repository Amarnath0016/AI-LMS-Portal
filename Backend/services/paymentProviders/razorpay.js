/**
 * Razorpay Payment Provider Stub
 * Configured so Razorpay Test/Live mode can replace Demo mode without changing UI contracts.
 */
export const processRazorpayPayment = async ({ plan, course, paymentData }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured."
    );
  }

  // When live Razorpay is connected, verify razorpay_signature using crypto HMAC-SHA256
  const paymentId = paymentData?.razorpay_payment_id || `rzp_test_${Date.now()}`;

  return {
    success: true,
    paymentMode: "razorpay",
    paymentReference: paymentId,
    amount: plan.price,
    currency: "INR",
  };
};
