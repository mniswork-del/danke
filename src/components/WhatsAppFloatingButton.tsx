import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = '919792274818',
  defaultMessage = 'Hello University Tree, I need help with previous year question papers / syllabus.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);

  const directUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  const handleSendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = customMsg.trim() || defaultMessage;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <aside
      id="whatsapp-floating-widget"
      aria-label="WhatsApp Support Helpdesk"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Mini Chat Card Popover */}
      {isOpen && (
        <div
          id="whatsapp-mini-chatbox"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-80 rounded-2xl bg-white border border-emerald-100 shadow-2xl shadow-emerald-950/20 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-700" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">
                  University Tree Support
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online • Student Helpdesk
                </p>
              </div>
            </div>
            <button
              id="whatsapp-chatbox-close-button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close WhatsApp chatbox"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-slate-50/80 space-y-3">
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-slate-200/80 shadow-2xs text-xs text-slate-700 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Namaste & Welcome!</span>
              </div>
              <p>
                Koi bhi paper chahiye, wrong paper report karna ho ya doubt ho? Direct humse WhatsApp par baat karein.
              </p>
              <div className="text-[10px] text-slate-400 text-right pt-0.5">
                Official: +91 9792274818
              </div>
            </div>

            {/* Quick action chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Need 2024 Question Paper',
                'Download Issue',
                'Upload Query',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`whatsapp-suggestion-btn-${idx}`}
                  onClick={() => setCustomMsg(suggestion)}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 transition-colors text-left cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSendDirect} className="pt-2">
              <div className="relative">
                <input
                  id="whatsapp-chatbox-input"
                  type="text"
                  placeholder="Type your query here..."
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-2xs"
                />
                <button
                  id="whatsapp-chatbox-send-button"
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  aria-label="Send to WhatsApp"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="relative group flex items-center">
        {/* Tooltip Preview (Desktop & Mobile when closed) */}
        {!isOpen && showTooltip && (
          <div
            id="whatsapp-floating-tooltip"
            className="hidden sm:flex items-center space-x-2 mr-3 px-3.5 py-2 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-slate-800 animate-in fade-in slide-in-from-right-2 duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="whitespace-nowrap">Need Help? Chat on WhatsApp</span>
            <button
              onClick={e => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-white p-0.5 ml-1 rounded-full cursor-pointer"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Pulse glow background ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />

        {/* Main WhatsApp Button */}
        <button
          id="whatsapp-floating-action-button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#25D366] via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/80"
          aria-label="Open WhatsApp Support Chat"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-7 h-7 text-white fill-white" />
          )}

          {/* Unread notification indicator badge */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-xs">
              1
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
