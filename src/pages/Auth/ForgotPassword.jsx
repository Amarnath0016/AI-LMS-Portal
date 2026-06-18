import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Field, FormMessage } from "@/components/ui/form";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    setMessage(null);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      setMessage({ type: "error", text: "We need your account email to send a reset code." });
      toast.error("Enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: "success", text: "Reset code sent. Continue to OTP verification." });
      toast.success("Reset code sent");
      navigate("/verify-otp", { state: { email } });
    }, 900);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-upto-blue/10 text-upto-blue">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black">Forgot Password</h1>
          <p className="mt-2 text-muted">Request a one-time code to reset your account access.</p>
        </div>

        <div className="app-card rounded-lg p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
            <Field
              id="reset-email"
              label="Account Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={error}
            />
            <Button type="submit" variant="gradient" className="h-12 w-full" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Code <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-upto-blue hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
