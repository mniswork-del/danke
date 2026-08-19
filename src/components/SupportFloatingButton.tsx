import React, { useState } from 'react';
import {
  Headphones,
  X,
  BookOpen,
  HelpCircle,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SupportFloatingButtonProps {
  onOpenSupportPage: () => void;
  onOpenUpload?: () => void;
}

export const SupportFloatingButton: React.FC<SupportFloatingButtonProps> = ({
  onOpenSupportPage,
  onOpenUpload,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const WHATSAPP_RAW = '919792274818';
  const WHATSAPP_NUMBER = '+91 9792274818';

  const handleNavigateSupport = (sectionId?: string) => {
    onOpenSupportPage();
    setIsOpen(false);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <aside
      id="support-floating-widget"
      aria-label="Student Support Help Center"
      className="fixed bottom-22 right-5 sm:bottom-24 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Quick Help Card Popover */}
      {isOpen && (
        <div
          id="support-mini-modal"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-84 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">
                  Student Helpdesk & Guide
                </h4>
                <p className="text-[11px] text-blue-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24x7 Academic Support
                </p>
              </div>
            </div>
            <button
              id="support-chatbox-close-button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close support modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-4 bg-slate-50/80 space-y-2.5">
            <p className="text-xs text-slate-500 font-medium px-1">
              Select what you need help with:
            </p>

            {/* Quick Link 1: Step-by-Step Guide */}
            <button
              onClick={() => handleNavigateSupport('how-it-works-block')}
              className="w-full p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200/90 hover:border-blue-300 transition-all flex items-center justify-between group cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    1. How It Works Guide
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Step-by-step papers & search guide
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Quick Link 2: FAQs */}
            <button
              onClick={() => handleNavigateSupport('faq-block')}
              className="w-full p-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-300 transition-all flex items-center justify-between group cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    2. FAQs & Guidelines
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Answers to common student questions
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Quick Link 3: Complaint / Issue */}
            <button
              onClick={() => handleNavigateSupport('complaint-and-contact-block')}
              className="w-full p-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200/90 hover:border-rose-300 transition-all flex items-center justify-between group cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    3. Report Issue / Missing Paper
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Direct complaint & paper request
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Direct WhatsApp Action */}
            <a
              href={`https://wa.me/${WHATSAPP_RAW}?text=Hello%20University%20Tree%20Support%2C%20I%20need%20help`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct Support ({WHATSAPP_NUMBER})</span>
            </a>

            {/* View Full Support Desk button */}
            <button
              onClick={() => handleNavigateSupport()}
              className="w-full py-2 text-center text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Go to Full Support Desk Page</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="relative group flex items-center">
        {/* Tooltip Preview */}
        {!isOpen && showTooltip && (
          <div
            id="support-floating-tooltip"
            className="hidden sm:flex items-center space-x-2 mr-3 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-slate-800 animate-in fade-in slide-in-from-right-2 duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="whitespace-nowrap">Help & Support Desk</span>
            <button
              onClick={e => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-white p-0.5 ml-0.5 rounded-full cursor-pointer"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Main Support Button */}
        <button
          id="support-floating-action-button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/80"
          aria-label="Open Support & Help Center"
          title="Student Help & Support Desk"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Headphones className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </aside>
  );
};
