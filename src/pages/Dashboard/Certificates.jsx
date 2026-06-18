import { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { Award, ShieldCheck, Download, Share2, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState } from "@/components/ui/dashboard";
import { toast } from "sonner";

export default function CertificatesPage() {
  const { certificates } = useAuthContext();
  const [activeCertId, setActiveCertId] = useState(certificates[0]?.id || null);
  
  // Verification states
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const activeCert = certificates.find((c) => c.id === activeCertId);

  const handleDownload = (certTitle) => {
    toast.info(`Generating high-resolution PDF for "${certTitle}"...`);
    setTimeout(() => {
      toast.success(`Download complete! saved "${certTitle}.pdf"`);
    }, 1500);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    // Search certificates (mock matches local state default list or dynamically added certificates)
    const match = certificates.find(
      (c) => c.verificationCode.toLowerCase() === verificationCode.trim().toLowerCase()
    );

    if (match) {
      setVerificationResult({
        valid: true,
        certName: match.title,
        recipient: "Shailesh Chaudhari",
        issuedDate: match.date,
        mentor: match.mentor,
      });
    } else {
      setVerificationResult({
        valid: false,
      });
    }
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Credentials</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Certificates</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Access your completed course certifications, download professional PDFs, and verify credentials via security hashes.
        </p>
      </HeroPanel>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Certificate List & Verification Search */}
        <div className="lg:col-span-1 space-y-8">
          <SectionCard title="My Certificates">
            <div className="space-y-3">
              {certificates.map((cert) => (
                <button
                  key={cert.id}
                  onClick={() => setActiveCertId(cert.id)}
                  className={`w-full text-left rounded-xl p-4 border transition-all flex items-center gap-3 ${
                    activeCertId === cert.id
                      ? "border-upto-blue bg-upto-blue/5 shadow-sm"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-upto-orange/10 text-upto-orange">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-extrabold text-[hsl(var(--foreground))] truncate leading-snug">
                      {cert.title}
                    </h4>
                    <p className="text-[10px] text-muted mt-0.5 truncate">Issued by {cert.mentor}</p>
                  </div>
                </button>
              ))}
              {certificates.length === 0 && (
                <p className="text-xs text-muted text-center py-6">No certificates found. Complete a course to earn one.</p>
              )}
            </div>
          </SectionCard>

          {/* Certificate Verification Engine */}
          <SectionCard title="Verify Credentials" description="Enter a verification ID code to check its authenticity.">
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="e.g. UPTO-PY-8823-XYZ"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="pl-10 text-xs font-bold"
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full text-xs py-2">
                Verify Certificate
              </Button>
            </form>

            {verificationResult && (
              <div className="mt-4 rounded-lg p-4 border text-xs leading-relaxed">
                {verificationResult.valid ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-upto-green font-extrabold">
                      <CheckCircle className="h-4.5 w-4.5" /> VERIFIED CREDENTIAL
                    </div>
                    <p className="text-muted mt-1">
                      This certificate is authentic and registered under the database.
                    </p>
                    <div className="bg-[hsl(var(--surface))] p-2.5 rounded space-y-1 mt-2 font-semibold text-[11px]">
                      <div>Recipient: <span className="text-[hsl(var(--foreground))] font-black">{verificationResult.recipient}</span></div>
                      <div>Course: <span className="text-[hsl(var(--foreground))] font-black">{verificationResult.certName}</span></div>
                      <div>Mentor: <span className="text-[hsl(var(--foreground))] font-black">{verificationResult.mentor}</span></div>
                      <div>Issue Date: <span className="text-[hsl(var(--foreground))] font-black">{verificationResult.issuedDate}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-500 font-extrabold">
                      <XCircle className="h-4.5 w-4.5" /> INVALID CODE
                    </div>
                    <p className="text-muted">
                      No matching record found. Please verify the code hash and try again.
                    </p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Digital Certificate Mockup Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {activeCert ? (
            <SectionCard title="Certificate Viewer">
              <div className="flex flex-col gap-5 items-center">
                {/* Certificate Mockup Wrapper */}
                <div className="relative w-full aspect-[1.4] rounded-lg border-8 border-amber-600/30 bg-orange-950/5 p-6 sm:p-10 text-center flex flex-col justify-between overflow-hidden shadow-xl shadow-amber-950/5">
                  {/* Glowing background shapes */}
                  <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
                  <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-upto-blue/10 blur-3xl" />
                  
                  {/* Golden seal background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                    <Award className="h-64 w-64 text-amber-500" />
                  </div>

                  {/* Header */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">
                      Certificate of Completion
                    </h2>
                    <p className="text-[10px] text-muted font-bold">UPTOSKILLS TECHNICAL LMS ACADEMY</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-3 my-4">
                    <p className="text-[10px] text-muted italic font-medium">This is proudly presented to</p>
                    <h3 className="text-lg sm:text-2xl font-black tracking-wide text-upto-gradient-text uppercase py-1">
                      Shailesh Chaudhari
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted max-w-md mx-auto leading-relaxed">
                      for successfully completing all syllabus modules, technical quizzes, and coding challenges for the technical course
                    </p>
                    <h4 className="text-sm sm:text-base font-extrabold text-[hsl(var(--foreground))] px-4 py-1.5 rounded-lg bg-[hsl(var(--surface))]/80 inline-block border border-[hsl(var(--border))]">
                      {activeCert.title}
                    </h4>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between border-t border-[hsl(var(--border))] pt-4">
                    <div className="text-left space-y-1">
                      <p className="text-[9px] text-muted font-bold">VERIFICATION ID</p>
                      <p className="text-[10px] font-black text-upto-blue">{activeCert.verificationCode}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-6 flex items-center justify-center italic text-xs font-bold text-amber-600 font-serif">
                        {activeCert.mentor}
                      </div>
                      <div className="w-24 border-t border-muted/30 my-0.5" />
                      <p className="text-[8px] text-muted font-black uppercase tracking-wider">AI Lead Instructor</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] text-muted font-bold">DATE OF ISSUE</p>
                      <p className="text-[10px] font-black text-[hsl(var(--foreground))]">{activeCert.date}</p>
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex gap-3 mt-4 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-xs py-2.5"
                    onClick={() => handleDownload(activeCert.title)}
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 gap-2 text-xs py-2.5"
                    onClick={() => {
                      navigator.clipboard.writeText(activeCert.verificationCode);
                      toast.success("Verification ID copied to clipboard!");
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Copy Verification Code
                  </Button>
                </div>
              </div>
            </SectionCard>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-muted">
              <Award className="mx-auto h-12 w-12 opacity-30 mb-4" />
              <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">No certificates earned yet</h4>
              <p className="text-xs mt-1">Complete courses to 100% and checkout your achievements to unlock certifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
