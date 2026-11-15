import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Github, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Field, FormMessage } from "@/components/ui/form";
import { useAuthContext } from "@/store/AuthContext";
import { ROLES } from "@/constants";
import { authApi } from "@/api/endpoints";

const loginRoles = ["student", "admin"];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [adminVerification, setAdminVerification] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  const handleSocialLogin = (provider) => {
    setSocialLoading(provider);
    setTimeout(() => {
      if (provider === "github") {
        window.location.href = "https://github.com/login";
      } else {
        window.location.href = "https://accounts.google.com/signin";
      }
    }, 800);
  };

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
    setMessage(null);
    setAdminVerification(false);
    setAdminCode("");
  };

  const submit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email.includes("@")) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (role === "admin" && adminVerification && !adminCode.trim()) {
      nextErrors.adminCode = "Enter your admin security access code.";
    }

    setErrors(nextErrors);
    setMessage(null);
    if (Object.keys(nextErrors).length) {
      setMessage({ type: "error", text: "Please fix the highlighted fields." });
      return toast.error("Please fix the highlighted fields");
    }

    if (role === "admin" && !adminVerification) {
      setAdminVerification(true);
      setMessage({ type: "info", text: "Admin credentials entered. Please enter your admin security code." });
      toast.info("Admin access code required");
      return;
    }

    setLoading(true);
    authApi
      .login({ email, password, role, adminCode })
      .then((res) => {
        const { user: backendUser, token } = res.data;
        login(backendUser, token);
        setLoading(false);
        setMessage({ type: "success", text: "Signed in successfully. Redirecting..." });
        toast.success("Welcome back!");
        if (backendUser.role === ROLES.ADMIN || role === "admin") navigate("/admin");
        else navigate("/dashboard");
      })
      .catch((err) => {
        setLoading(false);
        const errorMsg =
          err.response?.data?.message ||
          (err.message === "Network Error"
            ? "Cannot reach authentication server. Please check your network connection."
            : "Invalid email or password.");
        setMessage({ type: "error", text: errorMsg });
        toast.error(errorMsg);
      });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))] lg:block">
        <div className="relative flex h-full flex-col justify-between p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-upto-blue/30 bg-upto-blue/10 px-4 py-2 text-sm text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              UptoSkills AI Learning
            </div>
            <h1 className="mt-8 text-5xl font-black leading-tight">
              Learn from
              <span className="block upto-gradient-text">AI Celebrity Mentors</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Continue your leagues, maintain streaks, earn XP, and master real-world skills.
            </p>
          </div>
          <p className="text-xs text-muted">© 2026 UptoSkills · Delhi, India</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="app-card rounded-lg p-6 sm:p-8">
            <h2 className="text-3xl font-black">Sign In</h2>
            <p className="mt-2 text-sm text-muted">Welcome back to UptoSkills AI</p>

            <div className="mt-6 grid grid-cols-2 rounded-lg bg-[hsl(var(--surface))] p-1">
              {loginRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => selectRole(r)}
                  className={`rounded-lg py-2.5 text-xs font-bold capitalize transition-all ${
                    role === r ? "bg-upto-blue text-white" : "text-muted hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleSocialLogin("github")}
                disabled={loading || socialLoading !== null}
              >
                {socialLoading === "github" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleSocialLogin("google")}
                disabled={loading || socialLoading !== null}
              >
                {socialLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-5">
              {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Field
                id="password"
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              {role === "admin" && adminVerification && (
                <Field
                  id="admin-code"
                  label="Admin Access Code"
                  type="password"
                  placeholder="Enter admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  error={errors.adminCode}
                  hint="Server-verified admin second factor."
                />
              )}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-semibold text-upto-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" variant="gradient" className="h-12 w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {role === "admin" && adminVerification ? "Verify & Sign In" : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              New here?{" "}
              <Link to="/register" className="font-semibold text-upto-blue hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
