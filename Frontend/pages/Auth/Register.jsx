import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Github, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Field, FormMessage } from "@/components/ui/form";
import { useAuthContext } from "@/store/AuthContext";
import { authApi } from "@/api/endpoints";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const handleSocialRegister = (provider) => {
    setSocialLoading(provider);
    setTimeout(() => {
      if (provider === "github") {
        window.location.href = "https://github.com/signup";
      } else {
        window.location.href = "https://accounts.google.com/signup";
      }
    }, 800);
  };

  const submit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your full name.";
    if (!email.includes("@")) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    setMessage(null);
    if (Object.keys(nextErrors).length) {
      setMessage({ type: "error", text: "Please fix the highlighted fields." });
      return toast.error("Please fix the highlighted fields");
    }

    setLoading(true);
    authApi
      .register({ name, email, password })
      .then((res) => {
        const { user: backendUser, token } = res.data;
        register(backendUser, token);
        setLoading(false);
        setMessage({ type: "success", text: "Account created. Taking you to mentors..." });
        toast.success("Account created! Choose your AI mentor.");
        navigate("/mentors");
      })
      .catch((err) => {
        setLoading(false);
        const errorMsg =
          err.response?.data?.message ||
          (err.message === "Network Error"
            ? "Cannot reach registration server. Please check your network connection."
            : "Registration failed. Please check your information.");
        setMessage({ type: "error", text: errorMsg });
        toast.error(errorMsg);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg upto-gradient">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black">Join UptoSkills</h1>
          <p className="mt-2 text-muted">Start learning from AI celebrity mentors</p>
        </div>

        <div className="app-card rounded-lg p-6 sm:p-8">
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => handleSocialRegister("github")}
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
              onClick={() => handleSocialRegister("google")}
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
          <form onSubmit={submit} className="space-y-5">
            {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
            <Field id="name" label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <Field id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Field id="password" label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="Use at least 8 characters." />
            <Button type="submit" variant="gradient" className="h-12 w-full" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-upto-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
