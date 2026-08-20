import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Heart, Mail, Award, BookOpen, MessageCircle, Headphones } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenUpload }) => {
  const WHATSAPP_SUPPORT_URL =
    'https://wa.me/919792274818?text=Hello%20University%20Tree%20Support%20Team';

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Logo size="md" />
            <p className="text-xs text-slate-500 leading-relaxed">
              India's premier academic repository for previous year question papers, teacher-verified answer keys, and free educational open-resource e-books.
            </p>
            
            {/* WhatsApp Support Box */}
            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-xs text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3.5 py-2.5 rounded-2xl transition-all shadow-2xs w-fit"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Support Desk: +91 9792274818</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
              Explore Material
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <a
                  href="/papers"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('papers');
                  }}
                  className="hover:text-emerald-700 cursor-pointer block"
                >
                  Question Papers (PYQs)
                </a>
              </li>
              <li>
                <a
                  href="/ebooks"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('ebooks');
                  }}
                  className="hover:text-emerald-700 cursor-pointer block"
                >
                  Free Open E-Books
                </a>
              </li>
              <li>
                <a
                  href="/answer-keys"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('answer-keys');
                  }}
                  className="hover:text-emerald-700 cursor-pointer block"
                >
                  Verified Answer Keys
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('support');
                  }}
                  className="hover:text-emerald-700 text-emerald-800 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guide & Support</span>
                </a>
              </li>
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home');
                  }}
                  className="hover:text-emerald-700 cursor-pointer block"
                >
                  Find Your Path (All Levels)
                </a>
              </li>
            </ul>
          </div>

          {/* Boards & Universities */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
              Popular Boards & Exams
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>CBSE & ICSE School Boards</li>
              <li>AKTU, DU, SPPU, VTU Universities</li>
              <li>JEE Main, NEET UG & GATE Entrance</li>
              <li>UPSC CSE & SSC CGL Competitive</li>
            </ul>
          </div>

          {/* Contribution & Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
              Contribution & Fair Use
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              All question papers and study guides are shared strictly for non-commercial educational reference and examination preparation under fair use.
            </p>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-2xs cursor-pointer transition-all"
            >
              Upload Paper & Earn ₹5
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} University Tree • Built for Students Across India
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/support"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('support');
              }}
              className="hover:text-slate-600 cursor-pointer"
            >
              Help & FAQs
            </a>
            <span>•</span>
            <a
              href="/support"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('support');
              }}
              className="hover:text-slate-600 cursor-pointer"
            >
              Terms of Contribution
            </a>
            <span>•</span>
            <a
              href="/support"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('support');
              }}
              className="hover:text-slate-600 cursor-pointer"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('admin');
              }}
              className="hover:text-slate-600 cursor-pointer transition-colors"
              title="Admin Panel"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
