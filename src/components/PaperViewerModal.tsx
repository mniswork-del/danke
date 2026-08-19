import React, { useState } from 'react';
import { PaperItem, AnswerKeyItem, User } from '../types';
import {
  X,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  FileText,
  AlertTriangle,
  Share2,
  Bookmark,
  Sparkles,
  BookOpen,
  Check,
  ShieldCheck,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import { incrementPaperDownload, toggleBookmark, getBookmarks, calculateProfileCompletion } from '../lib/storage';

interface PaperViewerModalProps {
  paper: PaperItem | null;
  onClose: () => void;
  onOpenReport: (paper: PaperItem) => void;
  onSelectRelatedPaper: (paper: PaperItem) => void;
  allPapers: PaperItem[];
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onOpenProfileCompletion?: () => void;
}

export const PaperViewerModal: React.FC<PaperViewerModalProps> = ({
  paper,
  onClose,
  onOpenReport,
  onSelectRelatedPaper,
  allPapers,
  currentUser = null,
  onOpenAuth,
  onOpenProfileCompletion,
}) => {
  if (!paper) return null;

  const [activeView, setActiveView] = useState<'paper' | 'solution'>('paper');
  const [downloaded, setDownloaded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => getBookmarks().includes(paper.id));
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const profileStats = calculateProfileCompletion(currentUser);

  const handleDownload = () => {
    // Gate check: If user not logged in
    if (!currentUser) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      }
      return;
    }

    // Gate check: If profile not ready (Name, Email, DOB, Place)
    if (!profileStats.isReady) {
      if (onOpenProfileCompletion) {
        onClose();
        onOpenProfileCompletion();
      }
      return;
    }

    incrementPaperDownload(paper.id);
    setDownloaded(true);

    // Trigger download
    const link = document.createElement('a');
    link.href = paper.fileUrl;
    link.download = paper.fileName || `${paper.subject}_${paper.year}_PYQ.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleBookmark = () => {
    const next = toggleBookmark(paper.id);
    setIsBookmarked(next);
  };

  // Find related papers from same university/board or subject
  const relatedPapers = allPapers
    .filter(p => p.id !== paper.id && p.status === 'APPROVED' && (p.institution === paper.institution || p.subject === paper.subject))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-emerald-50/40 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {paper.institution}
              </span>
              <span className="text-[10px] font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                Year {paper.year}
              </span>
              {paper.examType && (
                <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {paper.examType}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
              {paper.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
              title="Bookmark for later"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Share Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left / Center 2-Columns: Document Preview */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* View Switcher Tabs (Paper vs Solutions) */}
            {paper.hasSolutions && (
              <div className="flex items-center space-x-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveView('paper')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'paper'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Question Paper
                </button>
                <button
                  onClick={() => setActiveView('solution')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeView === 'solution'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Answer Key / Solutions</span>
                </button>
              </div>
            )}

            {/* Embedded Clean PDF Viewer Container */}
            <div className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden relative min-h-[400px] flex flex-col">
              <div className="p-3 bg-white border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{activeView === 'paper' ? paper.fileName : 'Verified_Answer_Key_Solutions.pdf'}</span>
                </span>
                <span>{paper.pageCount} Pages • {paper.fileSize}</span>
              </div>

              {/* PDF Preview Frame / Simulated High-Resolution Viewer */}
              <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center bg-slate-100/70">
                <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 text-left space-y-4">
                  <div className="text-center border-b border-slate-100 pb-3">
                    <div className="text-xs font-bold uppercase text-slate-400">
                      {paper.institution}
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {paper.subject} ({paper.subjectCode || 'EXAM'})
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                      {paper.course} • {paper.year}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="font-bold text-slate-900">
                      {activeView === 'paper' ? 'SECTION A - (Compulsory Questions)' : 'OFFICIAL ANSWER KEY & STEP SOLUTIONS'}
                    </p>
                    <p>Q1. Explain the relational data model constraints and ACID properties in transaction processing.</p>
                    <p>Q2. Derive the time complexity of QuickSort under best and worst case partitions.</p>
                    <p>Q3. Define BCNF and give a 3-table normalized schema with functional dependencies.</p>
                  </div>

                  <div className="text-[11px] text-slate-400 text-center italic">
                    [Preview truncated. Download full authentic {paper.pageCount}-page verified document below.]
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloaded ? 'Downloaded Successfully!' : 'Download Full PDF Document'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description & Context Note */}
            {paper.description && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Paper Details & Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{paper.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Related Papers */}
          <div className="space-y-5">
            
            {/* Metadata Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Academic Metadata
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Board / University:</span>
                  <span className="font-bold text-slate-900 text-right">{paper.institution}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Course / Class:</span>
                  <span className="font-bold text-slate-900 text-right">{paper.course}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-bold text-emerald-800 text-right">{paper.subject}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Exam Year:</span>
                  <span className="font-bold text-amber-600 text-right">{paper.year}</span>
                </div>

                {paper.semester && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Semester / Term:</span>
                    <span className="font-bold text-slate-900 text-right">{paper.semester}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Language:</span>
                  <span className="font-bold text-slate-900 text-right">{paper.language || 'English'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Contributed By:</span>
                  <span className="font-bold text-slate-900 text-right flex items-center space-x-1">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span>{paper.uploaderName}</span>
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Downloads:</span>
                  <span className="font-bold text-slate-900">{paper.downloadsCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Copyright Notice Box & Report Action */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Fair Educational Use Notice</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                This academic material is shared for student study, educational research, and revision purposes only.
              </p>
              <button
                onClick={() => onOpenReport(paper)}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer pt-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Report copyright issue or wrong subject</span>
              </button>
            </div>

            {/* Related Papers */}
            {relatedPapers.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-slate-700">Related Papers from Same Board</h4>
                <div className="space-y-2">
                  {relatedPapers.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelatedPaper(rel)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-colors cursor-pointer"
                    >
                      <div className="text-[10px] text-slate-500 font-medium">{rel.year} • {rel.course}</div>
                      <div className="text-xs font-bold text-slate-900 truncate">{rel.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
