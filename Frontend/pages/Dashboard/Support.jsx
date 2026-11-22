import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { HelpCircle, ChevronDown, MessageSquare, Send, Mail, AlertTriangle, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";
import { toast } from "sonner";

const faqs = [
  { q: "How do I earn XP points in Uptoskills?", a: "You can earn XP by enrolling in courses, watching lectures, and playing Quiz & XP Leagues. Quizzes are divided into parts and award XP based on your score." },
  { q: "How do I download my course certificate?", a: "Once your course progress reaches 100%, head to the 'Certificates' tab. You'll find your earned credential there with options to view, download, or copy the verification ID code." },
  { q: "Can I swap or choose my AI celebrity mentor?", a: "Yes! On the 'Course Catalog' page, each course card features a dropdown selector to choose your celebrity mentor. You can swap them at any time." },
  { q: "What should I do if a quiz doesn't load?", a: "Please try refreshing the page. If the issue persists, use the 'Report an Issue' form on this page or message our AI Support Chatbot directly." },
];

export default function SupportPage() {
  const [supportMessages, setSupportMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! How can I help you today with your courses, quizzes, or account?",
      time: "Just now",
    },
  ]);
  const [openFaq, setOpenFaq] = useState(null);
  
  // Issue reporting states
  const [reportCategory, setReportCategory] = useState("Bug");
  const [reportSeverity, setReportSeverity] = useState("Medium");
  const [reportDesc, setReportDesc] = useState("");

  // Chat states
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [supportMessages]);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    toast.success("Issue submitted! Ticket ID: #UPTO-" + Math.floor(100000 + Math.random() * 900000));
    setReportDesc("");
  };

  const addSupportMessage = (text) => {
    const userMsg = { id: Date.now(), sender: "user", text, time: "Just now" };
    setSupportMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      setSupportMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Thank you for reaching out! Our AI support agent is investigating your request.",
          time: "Just now",
        },
      ]);
    }, 600);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addSupportMessage(chatInput.trim());
    setChatInput("");
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Support</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Help & Support</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Find answers to frequently asked questions, report technical issues, or chat live with our support assistant.
        </p>
      </HeroPanel>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: FAQs & Bug Reporter */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ Accordion */}
          <SectionCard title="Frequently Asked Questions" description="Answers to common platform and league queries.">
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-[hsl(var(--foreground))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--border))]/30 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-upto-blue" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 text-xs text-muted leading-relaxed bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Issue Reporter */}
          <SectionCard title="Report an Issue" description="Found a bug or running into technical problems? Let us know.">
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Issue Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="mt-1 block h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                  >
                    <option value="Bug">Bug Report</option>
                    <option value="Quiz Issue">Quiz / XP Glitch</option>
                    <option value="Billing">Billing & Pricing</option>
                    <option value="Mentor Video">AI Mentor Player Issue</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Severity Level</label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="mt-1 block h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                  >
                    <option value="Low">Low - Minor tweak</option>
                    <option value="Medium">Medium - Annoying bug</option>
                    <option value="High">High - Blocks learning progress</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Description</label>
                <textarea
                  placeholder="Explain what happened, steps to reproduce, or details of the issue..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                  required
                />
              </div>
              <Button type="submit" variant="gradient" className="gap-2">
                <AlertTriangle className="h-4 w-4" /> Submit Ticket
              </Button>
            </form>
          </SectionCard>
        </div>

        {/* Right Side: Live Support Chat UI */}
        <div className="space-y-6">
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-upto-blue animate-pulse" />
                Live Support Bot
              </span>
            }
            description="Chat live with our automated assistant for instant solutions."
          >
            <div className="flex flex-col h-[450px]">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 p-2 rounded-lg bg-[hsl(var(--surface))] border border-[hsl(var(--border))]">
                {supportMessages.map((msg, idx) => {
                  const isBot = msg.sender === "bot";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                        isBot
                          ? "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] mr-auto rounded-tl-none"
                          : "bg-upto-blue text-white ml-auto rounded-tr-none"
                      }`}
                    >
                      {isBot && (
                        <span className="text-[9px] font-black text-upto-blue uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Cpu className="h-3 w-3" /> System Bot
                        </span>
                      )}
                      <p>{msg.text}</p>
                      <span className={`block text-[8px] font-bold mt-1 text-right ${isBot ? "text-muted" : "text-white/60"}`}>
                        {msg.time}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="text-xs"
                />
                <Button type="submit" variant="gradient">
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
