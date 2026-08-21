import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const WHATSAPP_URL = 'https://wa.me/919792274818?text=Hello%20University%20Tree%2C%20I%20need%20help!';

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-pulse-slow group"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      
      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-3 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        Chat Support
      </span>
      
      {/* Pulse Ring Animation */}
      <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
    </a>
  );
};
