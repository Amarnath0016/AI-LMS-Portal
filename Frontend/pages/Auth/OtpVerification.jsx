import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { FormMessage } from "@/components/ui/form";
import { authApi } from "@/api/endpoints";

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const email = location.state?.email || "";
  const otpValue = useMemo(() => otp.join(""), [otp]);

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const submit = (event) => {
    event.preventDefault();
    setMessage(null);
    if (otpValue.length !== 6) {
      setMessage({ type: "error", text: "Enter the complete 6-digit verification code." });
      toast.error("Enter the 6-digit verification code");
      return;
    }

    if (!email) {
      setMessage({ type: "error", text: "Missing account email. Please restart password reset." });
      toast.error("Missing email");
      return;
    }

    setLoading(true);
    authApi
      .verifyOtp({ email, otp: otpValue })
      .then((res) => {
        setLoading(false);
        const successMsg = res.data?.message || "OTP verified successfully. You can now sign in.";
        setMessage({ type: "success", text: successMsg });
        toast.success("OTP verified");
        navigate("/login");
      })
      .catch((err) => {
        setLoading(false);
        const errorMsg =
          err.response?.data?.message ||
          (err.message === "Network Error"
            ? "Cannot reach verification server. Please check your connection."
            : "Invalid or expired verification code.");
        setMessage({ type: "error", text: errorMsg });
        toast.error(errorMsg);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-upto-green/10 text-upto-green">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black">OTP Verification</h1>
          <p className="mt-2 text-muted">
            {email ? `Enter the code sent to ${email}.` : "Enter the 6-digit verification code."}
          </p>
        </div>

        <div className="app-card rounded-lg p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
            <div className="grid grid-cols-6 gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  inputMode="numeric"
                  aria-label={`OTP digit ${index + 1}`}
                  value={digit}
                  onChange={(event) => updateOtp(index, event.target.value)}
                  className="px-0 text-center text-lg font-black"
                />
              ))}
            </div>
            <Button type="submit" variant="gradient" className="h-12 w-full" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify OTP <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Need another code?{" "}
            <Link to="/forgot-password" className="font-semibold text-upto-blue hover:underline">
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
