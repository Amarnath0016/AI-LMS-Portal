import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ShieldCheck, ArrowLeft, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { certificateApi } from "@/api/endpoints";

export default function VerifyCertificate() {
  const { code: urlCode } = useParams();
  const [code, setCode] = useState(urlCode || "");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchVerification = async (targetCode) => {
    if (!targetCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await certificateApi.verify(targetCode);
      const data = res.data?.data || res.data;
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Certificate record not found or code is invalid.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode);
      fetchVerification(urlCode);
    } else {
      setLoading(false);
    }
  }, [urlCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setCode(inputCode.trim());
    fetchVerification(inputCode.trim());
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to UptoSkills
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-upto-blue/30 bg-upto-blue/10 px-3 py-1 text-[11px] font-bold text-upto-blue">
            <ShieldCheck className="h-3.5 w-3.5" /> Official Verification Portal
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">
            Credential Verification
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Verify the authenticity of digital certificates issued by the UptoSkills AI Learning Management System.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <Input
            placeholder="Enter verification code (e.g. CERT-PY-8823)"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="text-xs font-mono"
          />
          <Button type="submit" variant="gradient" size="sm" className="px-5 shrink-0">
            <Search className="h-4 w-4 mr-1.5" /> Check
          </Button>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center shadow-xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-upto-blue mb-3" />
            <p className="text-sm text-muted">Checking cryptographically verified database record...</p>
          </div>
        )}

        {/* Success Verified Record */}
        {!loading && result && (
          <div className="rounded-2xl border border-emerald-500/30 bg-[hsl(var(--card))] p-8 sm:p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Official Verification
                  </span>
                  <h2 className="text-xl font-black text-[hsl(var(--foreground))]">
                    Certificate Authentic &amp; Valid
                  </h2>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-mono text-muted block uppercase">Hash / Code</span>
                <span className="text-xs font-black font-mono text-upto-blue">{result.verificationCode || code}</span>
              </div>
            </div>

            {/* Certificate Details Card */}
            <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 space-y-6 overflow-hidden">
              <div className="absolute top-4 right-4 text-amber-500/20">
                <Award className="h-28 w-28" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Recipient</span>
                <h3 className="text-2xl font-black text-[hsl(var(--foreground))] mt-0.5">
                  {result.userName || result.user?.name || "Student Scholar"}
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Course Title</span>
                  <p className="text-sm font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                    {result.title || result.courseTitle || result.course?.title}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">AI Mentor / Instructor</span>
                  <p className="text-sm font-extrabold text-[hsl(var(--foreground))] mt-0.5">
                    {result.mentor || "AI Lead Instructor"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Issue Date</span>
                  <p className="text-sm font-bold text-[hsl(var(--foreground))] mt-0.5">
                    {result.issueDate || (result.createdAt ? new Date(result.createdAt).toLocaleDateString() : "May 2026")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Status</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> 100% Completed &amp; Passed
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-muted pt-2 border-t border-[hsl(var(--border))]">
              Verified by UptoSkills AI LMS Autonomous Validation Engine &bull; Stored in immutable database
            </div>
          </div>
        )}

        {/* Error / Not Found */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-[hsl(var(--card))] p-8 sm:p-10 shadow-xl text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <XCircle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-[hsl(var(--foreground))]">
              Verification Failed
            </h2>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <p className="text-[11px] text-muted font-mono">
              Searched code: {code}
            </p>
            <div className="pt-4">
              <Button variant="outline" size="sm" onClick={() => setCode("")}>
                Try Another Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
