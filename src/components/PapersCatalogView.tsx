import React, { useState, useMemo } from 'react';
import { PaperItem, EducationCategory } from '../types';
import { PATH_CATEGORIES, ACADEMIC_DIRECTORY } from '../data/categoriesData';
import {
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  FileText,
  Eye,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PapersCatalogViewProps {
  papers: PaperItem[];
  initialCategory?: EducationCategory | null;
  onSelectPaper: (paper: PaperItem) => void;
  onOpenUpload: () => void;
}

export const PapersCatalogView: React.FC<PapersCatalogViewProps> = ({
  papers,
  initialCategory,
  onSelectPaper,
  onOpenUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
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
  ];

  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      if (p.status !== 'APPROVED') return false;

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (selectedState !== 'all' && p.state && !p.state.toLowerCase().includes(selectedState.toLowerCase()) && !selectedState.toLowerCase().includes(p.state.toLowerCase())) {
        return false;
      }

      if (selectedYear !== 'all' && p.year.toString() !== selectedYear) {
        return false;
      }

      if (selectedExamType !== 'all' && p.examType !== selectedExamType) {
        return false;
      }

      if (onlySolved && !p.hasSolutions) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSubject = p.subject.toLowerCase().includes(q);
        const matchesCourse = p.course.toLowerCase().includes(q);
        const matchesInst = p.institution.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesSubject && !matchesCourse && !matchesInst && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [papers, selectedCategory, selectedState, selectedYear, selectedExamType, onlySolved, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedState('all');
    setSelectedYear('all');
    setSelectedExamType('all');
    setOnlySolved(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Pan-India Examination Repository</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Previous Year Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse authentic exam papers from CBSE, State Boards, Central & Technical Universities, JEE, NEET, and UPSC.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <span>Upload Paper & Earn ₹5</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-8 bg-slate-50/80 p-4 sm:p-6 rounded-3xl border border-slate-200/80 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by subject, college name, course or keyword (e.g. DBMS, Physics, AKTU, UPSC)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdown Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800"
          >
            <option value="all">All Categories</option>
            {PATH_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* State */}
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800"
          >
            <option value="all">All States</option>
            {indianStates.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800"
          >
            <option value="all">All Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          {/* Exam Type */}
          <select
            value={selectedExamType}
            onChange={e => setSelectedExamType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800"
          >
            <option value="all">All Exam Types</option>
            <option value="End-Sem">End-Semester</option>
            <option value="Board-Final">Board Annual</option>
            <option value="Entrance">Entrance Exam</option>
            <option value="Prelims">Prelims</option>
          </select>
        </div>

        {/* Bottom Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOnlySolved(!onlySolved)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                onlySolved
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>With Answer Keys / Solutions Only</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-slate-500">
              Showing {filteredPapers.length} Question Papers
            </span>
            <button
              onClick={handleResetFilters}
              className="text-rose-600 font-bold hover:underline flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No question papers match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or contribute this paper to help other students.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map(paper => (
            <div
              key={paper.id}
              className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5 transition-all p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden ring-1 ring-slate-900/5"
            >
              {/* Highlight Ribbon */}
              <div className="absolute top-0 right-0">
                <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider shadow-2xs">
                  Available
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-2 pr-12">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 truncate max-w-[170px]">
                    {paper.institution}
                  </span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                    {paper.year}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                  {paper.title}
                </h3>

                <div className="text-xs font-medium text-slate-500 mt-1.5 flex items-center space-x-1.5">
                  <span className="text-slate-700 font-semibold">{paper.course}</span>
                  <span>•</span>
                  <span className="text-slate-600 truncate">{paper.subject}</span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  {paper.hasSolutions && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Answer Key Included</span>
                    </span>
                  )}
                  {paper.examType && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {paper.examType}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  <span>{paper.pageCount} Pages</span> • <span>{paper.fileSize}</span>
                </div>

                <button
                  onClick={() => onSelectPaper(paper)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all group-hover:shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Paper</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
