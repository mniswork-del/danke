import React, { useState, useMemo } from 'react';
import { PaperItem, EducationCategory } from '../types';
import { PATH_CATEGORIES } from '../data/categoriesData';
import {
  Search,
  X,
  SlidersHorizontal,
  FileText,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  Eye,
  Download,
  Filter,
  Check,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: PaperItem[];
  onSelectPaper: (paper: PaperItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  papers,
  onSelectPaper,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [onlySolved, setOnlySolved] = useState(false);

  const indianStates = [
    'All India',
    'Uttar Pradesh',
    'Maharashtra',
    'Delhi NCR',
    'Karnataka',
    'Tamil Nadu',
    'West Bengal',
    'Bihar',
    'Rajasthan',
    'Madhya Pradesh',
    'Gujarat',
    'Punjab',
    'Kerala',
  ];

  const filteredResults = useMemo(() => {
    return papers.filter(p => {
      if (p.status !== 'APPROVED') return false;

      // Text query match
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSubject = p.subject.toLowerCase().includes(q);
        const matchesCourse = p.course.toLowerCase().includes(q);
        const matchesInst = p.institution.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        const matchesYear = p.year.toString().includes(q);

        if (!matchesTitle && !matchesSubject && !matchesCourse && !matchesInst && !matchesTags && !matchesYear) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // State filter
      if (selectedState !== 'all' && p.state && !p.state.toLowerCase().includes(selectedState.toLowerCase()) && !selectedState.toLowerCase().includes(p.state.toLowerCase())) {
        return false;
      }

      // Year filter
      if (selectedYear !== 'all' && p.year.toString() !== selectedYear) {
        return false;
      }

      // Solved filter
      if (onlySolved && !p.hasSolutions) {
        return false;
      }

      return true;
    });
  }, [papers, query, selectedCategory, selectedState, selectedYear, onlySolved]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Header Input */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-emerald-50/40 flex items-center space-x-3">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exam, subject (e.g. DBMS, Physics 12, AKTU, UPSC, NEET)..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Category Pill Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {PATH_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* State Dropdown */}
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All States</option>
            {indianStates.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          {/* Solved Papers Toggle */}
          <button
            onClick={() => setOnlySolved(!onlySolved)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              onlySolved
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Solved Only</span>
          </button>

          {(selectedCategory !== 'all' || selectedState !== 'all' || selectedYear !== 'all' || onlySolved) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedState('all');
                setSelectedYear('all');
                setOnlySolved(false);
              }}
              className="text-[11px] text-rose-600 font-bold hover:underline ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          <div className="text-xs font-bold text-slate-500 mb-3">
            Showing {filteredResults.length} matching question papers
          </div>

          {filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No question papers found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with broader terms like "Maths", "B.Tech", or "2024".
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {filteredResults.map(paper => (
                <div
                  key={paper.id}
                  onClick={() => {
                    onSelectPaper(paper);
                    onClose();
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {paper.institution}
                      </span>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {paper.year}
                      </span>
                      {paper.hasSolutions && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded flex items-center space-x-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Solved</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {paper.title}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {paper.course} • {paper.subject} • {paper.fileSize} • {paper.pageCount} Pages
                    </p>
                  </div>

                  <button className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-2xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
