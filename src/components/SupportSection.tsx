import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  HelpCircle,
  CheckCircle2,
  Upload,
  Search,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
  FileText,
  BookOpen,
  ArrowRight,
  Clock,
  ShieldAlert,
  Heart,
  HelpCircle as QuestionIcon,
} from 'lucide-react';

interface SupportSectionProps {
  onOpenUpload: () => void;
  onNavigateHome: () => void;
  onNavigatePapers: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  onOpenUpload,
  onNavigateHome,
  onNavigatePapers,
}) => {
  const WHATSAPP_NUMBER = '+91 9792274818';
  const WHATSAPP_RAW = '919792274818';

  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [complaintType, setComplaintType] = useState('Paper Request / Missing Paper');
  const [studentName, setStudentName] = useState('');
  const [studentMobile, setStudentMobile] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const handleSendWhatsAppMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMessage.trim()) return;

    const formattedText = `*University Tree - Student Support / Issue Request*\n\n` +
      `*Category:* ${complaintType}\n` +
      `*Student Name:* ${studentName.trim() || 'Student'}\n` +
      `*Mobile Number:* ${studentMobile.trim() || 'N/A'}\n\n` +
      `*Details / Query:*\n${complaintMessage.trim()}`;

    const url = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(formattedText)}`;
    window.open(url, '_blank');
    setIsSubmitted(true);
  };

  const generalFaqs = [
    {
      q: 'Kya University Tree par question papers aur notes bilkul free hain?',
      a: 'Haan! University Tree 100% free open educational platform hai. Koi bhi student bina kisi hidden charge, subscription ya paywall ke question papers read aur download kar sakta hai.',
    },
    {
      q: 'Main apne college ya school ke question papers kaise share kar sakta hoon?',
      a: 'Aap "Upload Paper" button par click karke apne exam paper ka PDF ya clear scan upload kar sakte hain. Uploaded papers community review ke baad instantly live ho jaate hain.',
    },
    {
      q: 'Agar kisi paper me koi page missing ya blur ho to kya karein?',
      a: 'Aap Paper Viewer me "Report Issue" button use kar sakte hain ya niche diye gaye WhatsApp helpdesk form ke dwara complaint register kar sakte hain. Hamari team use replace kar degi.',
    },
    {
      q: 'Kya main bina login kiye question papers download kar sakta hoon?',
      a: 'Haan! Students bina kisi login ya registration ke seedha search karke PDF papers download kar sakte hain.',
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-black mb-3.5 border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Free Open Academic Repository</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Guide & Support Desk
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            University Tree ka pura process, free study materials guide, aur kisi bhi problem ke liye direct WhatsApp student support.
          </p>
        </div>

        {/* 1. HOW IT WORKS SECTION */}
        <section id="how-it-works-block" className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-1.5">
                <span>Step-by-Step Guide</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                1. How University Tree Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Free study materials access aur simple community sharing process.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Share Question Paper</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-emerald-400 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Select Board, College ya Exam
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Apne hisaab se category choose karein: CBSE, ICSE, State Boards, College Universities (AKTU, DU, RTU), ya Competitive Exams (NEET, JEE).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-emerald-700">
                ✓ Filter by Subject, Course & Year (2020–2025)
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-blue-400 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-base font-black text-slate-900">
                  100% Free Read & Download
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Screen par paper viewer me pura paper dekhein, verified solutions check karein, aur bina kisi login ya payment ke high-resolution PDF download karein.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-blue-700">
                ✓ Instant Free PDF Download
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-teal-400 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-base flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Upload & Help Fellow Students
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Apne exams ke original question papers ka PDF upload karein aur hazaron students ko unki exam preparation me madad karein.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-teal-700">
                ✓ Open Community Contribution
              </div>
            </div>
          </div>
        </section>

        {/* 2. COMMUNITY GUIDELINES & FAQS */}
        <section id="faq-block" className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Community & Academic Guidelines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              2. Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Platform rules, paper verification, aur study materials access se jude common sawal.
            </p>
          </div>

          {/* FAQ Cards */}
          <div className="space-y-3">
            {generalFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-slate-50/40"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {idx + 1}. {faq.q}
                  </span>
                  {faqOpen === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {faqOpen === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-200/60 bg-white leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. CONTACT WHATSAPP SUPPORT DESK */}
        <section id="complaint-and-contact-block" className="p-6 sm:p-10 rounded-3xl bg-white border-2 border-emerald-400/80 shadow-lg shadow-emerald-950/5 space-y-8">
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Immediate Resolution Desk</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                3. For Complaints, Issues & Queries — Contact WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Koi bhi samasya ho, wrong paper ho ya missing notes request, direct hamare WhatsApp number par sampark karein.
              </p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_RAW}?text=Hello%20University%20Tree%2C%20I%20have%20an%20issue%2Fquery`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer self-start sm:self-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Form: Submit Complaint / Issue */}
            <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Register Your Complaint / Query
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Form submit karte hi message seedha WhatsApp par open ho jayega:
              </p>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-emerald-900">WhatsApp Chat Opened!</h4>
                  <p className="text-xs text-emerald-700">
                    Aapka complaint/query message WhatsApp me format ho chuka hai. Hum jaldi se reply karenge.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    Send Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendWhatsAppMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issue / Query Category *
                    </label>
                    <select
                      value={complaintType}
                      onChange={e => setComplaintType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Paper Request / Missing Paper">Missing Question Paper / Notes Request</option>
                      <option value="Wrong / Blur Paper Complaint">Wrong, Blurry or Incomplete Paper Complaint</option>
                      <option value="Answer Key Correction">Answer Key Correction / Solution Doubt</option>
                      <option value="General Support / Other Query">General Support / Other Query</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aman Gupta"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={studentMobile}
                        onChange={e => setStudentMobile(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Complaint / Issue Description *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Apna issue ya complaint detail me likhein (Subject name, syllabus ya question doubt)..."
                      value={complaintMessage}
                      onChange={e => setComplaintMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Complaint to WhatsApp (+91 9792274818)</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Contact Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl">
              <div className="space-y-5">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    Official Support Contact
                  </span>
                  <h3 className="text-xl font-black mt-3 text-white">
                    Need Direct Help?
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Hamara student helpdesk WhatsApp par 24x7 active hai.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Official WhatsApp Number:
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wider">
                    {WHATSAPP_NUMBER}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Click below to initiate chat instantly without saving number.
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Missing paper / syllabus requests handled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Free study materials guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct resolution for any student complaint</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <a
                  href={`https://wa.me/${WHATSAPP_RAW}?text=Hello%20University%20Tree%20Support%2C%20I%20have%20a%20query`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  <span>Open WhatsApp (+91 9792274818)</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
