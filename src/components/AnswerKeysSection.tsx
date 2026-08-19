import React, { useState } from 'react';
import { AnswerKeyItem, PaperItem } from '../types';
import {
  Sparkles,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Search,
  Check,
  ShieldCheck,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';

interface AnswerKeysSectionProps {
  answerKeys: AnswerKeyItem[];
  allPapers: PaperItem[];
  onSelectPaper: (paper: PaperItem) => void;
}

// Fallback high-res preview image for academic answer keys
const DEFAULT_PREVIEW_IMG = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80';

export const AnswerKeysSection: React.FC<AnswerKeysSectionProps> = ({
  answerKeys,
  allPapers,
  onSelectPaper,
}) => {
  const [query, setQuery] = useState('');
  const [downloadedKeyId, setDownloadedKeyId] = useState<string | null>(null);

  const filteredKeys = answerKeys.filter(k => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      k.paperTitle.toLowerCase().includes(q) ||
      k.subject.toLowerCase().includes(q) ||
      k.institution.toLowerCase().includes(q) ||
      k.exam.toLowerCase().includes(q)
    );
  });

  const handleDownload = (keyItem: AnswerKeyItem) => {
    setDownloadedKeyId(keyItem.id);
    const link = document.createElement('a');
    link.href = keyItem.fileUrl;
    link.download = `${keyItem.subject}_Answer_Key_${keyItem.year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadedKeyId(null), 3000);
  };

  return (
    <section className="py-14 sm:py-20 bg-slate-50/80 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black mb-3 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified Step-by-Step Solutions & Scoring Rubrics</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Verified Answer Keys & Marking Schemes
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Teacher-verified solution sets, official NTA / CBSE / University board marking keys, and step-wise proofs with exact marking distribution.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search solution keys (e.g. CBSE Physics, NEET 2024, AKTU DBMS)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 shadow-sm transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full"
            >
              Clear
            </button>
          )}
        </div>

        {/* Answer Keys Grid with Dummy Document Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKeys.map(item => {
            const linkedPaper = allPapers.find(p => p.id === item.paperId);
            const previewUrl = item.previewImage || DEFAULT_PREVIEW_IMG;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Dummy Document Preview Image Header */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden border-b border-slate-100">
                    <img
                      src={previewUrl}
                      alt={`${item.paperTitle} Preview`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30 shadow-xs">
                        {item.institution.split('(')[0].trim()}
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-xs">
                        {item.year} Key
                      </span>
                    </div>

                    {/* Bottom Preview Overlay Info */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-bold drop-shadow-sm">
                      <span className="inline-flex items-center space-x-1.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>{item.pagesCount || 8} Solved Pages</span>
                      </span>
                      <span className="bg-emerald-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                        100% Free
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                      {item.paperTitle}
                    </h3>

                    <div className="text-xs text-slate-500 mt-1.5 font-medium flex items-center space-x-1.5">
                      <span className="truncate">{item.course}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-bold truncate">{item.subject}</span>
                    </div>

                    {/* Verified Scheme Badge */}
                    <div className="mt-4 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center space-x-2 text-emerald-900 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">Teacher Verified Official Marking Scheme</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  {linkedPaper ? (
                    <button
                      onClick={() => onSelectPaper(linkedPaper)}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Paper</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      PDF • {item.fileSize}
                    </span>
                  )}

                  <button
                    onClick={() => handleDownload(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95 ${
                      downloadedKeyId === item.id
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {downloadedKeyId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredKeys.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-6">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No matching answer keys found</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching by subject name (e.g., Physics, Maths) or exam board.</p>
            <button
              onClick={() => setQuery('')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Reset Search Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

