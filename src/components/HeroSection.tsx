import React from 'react';
import { Upload, BookOpen, CheckCircle2, Sparkles, Award, ArrowRight, GraduationCap } from 'lucide-react';

interface HeroSectionProps {
  onFindPapers: () => void;
  onUploadAndEarn: () => void;
  onSearchFocus: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFindPapers,
  onUploadAndEarn,
}) => {
  // Primary specified image with fallback
  const PRIMARY_HERO_IMAGE = 'https://universitytree.in/image/hero.webp';
  const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85';

  const [heroSrc, setHeroSrc] = React.useState(PRIMARY_HERO_IMAGE);

  return (
    <section className="relative overflow-hidden -mt-[102px] sm:-mt-[116px] pt-[112px] sm:pt-[140px] pb-14 md:pb-20 border-b border-slate-200/40 bg-slate-900 text-white">
      {/* Background Image Layer positioned behind floating header */}
      <div className="absolute -top-3 sm:top-0 inset-x-0 bottom-0 z-0 overflow-hidden">
        <img
          src={heroSrc}
          onError={() => setHeroSrc(FALLBACK_HERO_IMAGE)}
          alt="University Tree Hero Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-700"
        />
        
        {/* 30% Base Tone Overlay */}
        <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />

        {/* Smooth Fade Gradients on the Image (Top, Bottom & Radial Vignette Fade) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-slate-950/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-2 sm:mt-4">
        
        {/* Quality Guarantee & Live Repository Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-black mb-6 shadow-lg shadow-black/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>India-Wide Academic Repository • 100% Free Access</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight drop-shadow-lg">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Previous Year Papers</span> & Solutions
        </h1>

        {/* Subheading */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-100 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
          Previous year question papers, verified answer keys, and free syllabus guides — organized across school boards, colleges, and competitive exams.
        </p>

        {/* Primary Action Buttons - Kept in Single Line */}
        <div className="mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-2xl mx-auto">
          <button
            onClick={onFindPapers}
            className="px-4 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-98 text-white font-black text-xs sm:text-base shadow-lg shadow-emerald-600/40 transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer group shrink-0 whitespace-nowrap"
          >
            <span>Find Papers Free</span>
            <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onUploadAndEarn}
            className="px-4 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-98 text-white font-black text-xs sm:text-base shadow-lg shadow-orange-500/40 transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Upload className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>Upload Paper</span>
          </button>
        </div>

        {/* Floating Mini Tags / Recent Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold text-white/90 drop-shadow-xs mr-1">Popular Right Now:</span>
          {['CBSE 10th & 12th Board', 'AKTU B.Tech PYQs', 'NEET UG Papers', 'DU BA / BSc', 'Solved Keys'].map((tag, i) => (
            <button
              key={i}
              onClick={onFindPapers}
              className="px-3 py-1 rounded-full bg-slate-950/60 hover:bg-slate-900/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer shadow-xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Key Trust Highlights Cards */}
        <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-sm hover:border-emerald-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">50,000+ PYQs</div>
              <div className="text-[11px] text-slate-300">Solved Papers & Keys</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-sm hover:border-amber-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">100% Free & Open</div>
              <div className="text-[11px] text-slate-300">Community Powered</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Free E-Books</div>
              <div className="text-[11px] text-slate-300">Notes & Study Guides</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-sm hover:border-emerald-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">All India Boards</div>
              <div className="text-[11px] text-slate-300">Schools & Colleges</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
