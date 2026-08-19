import React, { useState, useMemo } from 'react';
import { EducationCategory, PaperItem } from '../types';
import { PATH_CATEGORIES, ACADEMIC_DIRECTORY } from '../data/categoriesData';
import {
  GraduationCap,
  Building2,
  Award,
  Compass,
  Wrench,
  Briefcase,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  FileText,
  Eye,
  Download,
  Calendar,
  Filter,
  Layers,
  ArrowLeft,
  Sparkles,
  MapPin,
  HelpCircle,
  Zap,
  Check,
  Search,
} from 'lucide-react';

interface PathFinderSectionProps {
  papers: PaperItem[];
  onSelectPaper: (paper: PaperItem) => void;
  onViewAllPapers: (category?: EducationCategory) => void;
}

export const PathFinderSection: React.FC<PathFinderSectionProps> = ({
  papers,
  onSelectPaper,
  onViewAllPapers,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EducationCategory | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Icon map for path cards
  const iconMap: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className="w-6 h-6 text-emerald-600" />,
    Building2: <Building2 className="w-6 h-6 text-emerald-600" />,
    Award: <Award className="w-6 h-6 text-amber-500" />,
    Compass: <Compass className="w-6 h-6 text-emerald-600" />,
    Wrench: <Wrench className="w-6 h-6 text-amber-500" />,
    Briefcase: <Briefcase className="w-6 h-6 text-emerald-600" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    BookOpen: <BookOpen className="w-6 h-6 text-amber-500" />,
  };

  // Directory info based on selectedCategory
  const categoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return ACADEMIC_DIRECTORY[selectedCategory] || null;
  }, [selectedCategory]);

  // Available Institutions
  const availableInstitutions = useMemo(() => {
    if (!categoryData) return [];
    return categoryData.institutions;
  }, [categoryData]);

  // Available Courses
  const availableCourses = useMemo(() => {
    if (!selectedInstitution || !categoryData) return [];
    const inst = categoryData.institutions.find(i => i.name === selectedInstitution);
    return inst ? inst.courses : [];
  }, [selectedInstitution, categoryData]);

  // Available Subjects
  const availableSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    const courseObj = availableCourses.find(c => c.name === selectedCourse);
    return courseObj ? courseObj.subjects : [];
  }, [selectedCourse, availableCourses]);

  // Available Years
  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020];

  // Matched Papers calculation
  const matchedPapers = useMemo(() => {
    if (!selectedCategory) return [];

    return papers.filter(p => {
      if (p.status !== 'APPROVED') return false;
      if (p.category !== selectedCategory) return false;
      if (selectedInstitution && !p.institution.toLowerCase().includes(selectedInstitution.toLowerCase().slice(0, 8)) && !selectedInstitution.toLowerCase().includes(p.institution.toLowerCase().slice(0, 8))) {
        // loose match
      }
      if (selectedCourse && !p.course.toLowerCase().includes(selectedCourse.toLowerCase().slice(0, 6))) {
        // loose match
      }
      if (selectedSubject && !p.subject.toLowerCase().includes(selectedSubject.toLowerCase().slice(0, 6))) {
        // loose match
      }
      if (selectedYear && Number(p.year) !== Number(selectedYear)) {
        return false;
      }
      return true;
    });
  }, [papers, selectedCategory, selectedInstitution, selectedCourse, selectedSubject, selectedYear]);

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedInstitution('');
    setSelectedCourse('');
    setSelectedSubject('');
    setSelectedYear('');
  };

  const handleCategorySelect = (cat: EducationCategory) => {
    setSelectedCategory(cat);
    setSelectedInstitution('');
    setSelectedCourse('');
    setSelectedSubject('');
    setSelectedYear('');

    // Smoothly scroll down and place the filter right in the middle of the display
    setTimeout(() => {
      const el = document.getElementById('path-discovery-flow');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  return (
    <section id="choose-your-path" className="py-12 sm:py-16 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast Academic Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Choose Your Path
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Select your education level, board, or examination to quickly explore question papers, syllabi & keys.
          </p>
        </div>

        {/* 8 Clean Path Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PATH_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-emerald-50/30 border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-emerald-100 transition-colors flex items-center justify-center mb-4">
                    {iconMap[cat.iconName]}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {cat.paperCount.toLocaleString()}+ Papers
                  </span>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 flex items-center space-x-1">
                    <span>Select</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step-by-Step Discovery Flow Interface */}
        {selectedCategory && (
          <div
            id="path-discovery-flow"
            className="bg-white border-2 border-emerald-400/90 rounded-3xl p-5 sm:p-8 shadow-xl shadow-emerald-950/5 ring-4 ring-emerald-500/10 animate-in fade-in zoom-in-95 duration-300 scroll-mt-24"
          >
            {/* Active Path Highlight Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="flex flex-wrap items-center text-xs font-medium text-slate-600 gap-1.5">
                <button
                  onClick={handleReset}
                  className="text-slate-500 hover:text-emerald-700 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Paths</span>
                </button>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="inline-flex items-center space-x-1.5 font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200 capitalize">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{PATH_CATEGORIES.find(c => c.id === selectedCategory)?.title}</span>
                </span>
                {selectedInstitution && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[140px]">{selectedInstitution}</span>
                  </>
                )}
                {selectedCourse && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[140px]">{selectedCourse}</span>
                  </>
                )}
                {selectedSubject && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">{selectedSubject}</span>
                  </>
                )}
                {selectedYear && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{selectedYear}</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            {/* 4-Step Selection Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Step 1: Select Board / University / Exam Body */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Board / University / Exam
                </label>
                <select
                  value={selectedInstitution}
                  onChange={e => {
                    setSelectedInstitution(e.target.value);
                    setSelectedCourse('');
                    setSelectedSubject('');
                    setSelectedYear('');
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">-- Choose Board / Body --</option>
                  {availableInstitutions.map((inst, idx) => (
                    <option key={idx} value={inst.name}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Course / Class / Stream */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Course / Class / Stream
                </label>
                <select
                  disabled={!selectedInstitution}
                  value={selectedCourse}
                  onChange={e => {
                    setSelectedCourse(e.target.value);
                    setSelectedSubject('');
                    setSelectedYear('');
                  }}
                  className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
                    !selectedInstitution
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white'
                  }`}
                >
                  <option value="">-- Choose Course / Class --</option>
                  {availableCourses.map((c, idx) => (
                    <option key={idx} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Select Subject / Paper */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. Subject / Paper Code
                </label>
                <select
                  disabled={!selectedCourse}
                  value={selectedSubject}
                  onChange={e => {
                    setSelectedSubject(e.target.value);
                    setSelectedYear('');
                  }}
                  className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
                    !selectedCourse
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white'
                  }`}
                >
                  <option value="">-- Choose Subject --</option>
                  {availableSubjects.map((s, idx) => (
                    <option key={idx} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Select Exam Year */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  4. Examination Year
                </label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">All Exam Years (2020-2025)</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Header Count & Quick Reset */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-black text-slate-900">
                  {matchedPapers.length} Question Paper{matchedPapers.length === 1 ? '' : 's'} Found Matching
                </h4>
              </div>

              {matchedPapers.length > 0 && (
                <button
                  onClick={() => onViewAllPapers(selectedCategory)}
                  className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Full Catalog View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Matched Papers Grid */}
            {matchedPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {matchedPapers.map(paper => (
                  <div
                    key={paper.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-400 hover:bg-white transition-all flex flex-col justify-between shadow-2xs group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 font-bold text-[10px] uppercase">
                          {paper.year} Exam
                        </span>
                        {paper.answerKeyUrl && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>Solved Key</span>
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-extrabold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {paper.title}
                      </h5>

                      <div className="mt-2 space-y-0.5 text-[11px] text-slate-500 font-medium">
                        <p className="truncate">🏛️ {paper.institution}</p>
                        <p className="truncate">📖 {paper.course} • {paper.subject}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {paper.downloadCount || 100}+ downloads
                      </span>
                      <button
                        onClick={() => onSelectPaper(paper)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No exact papers matching this specific filter combination yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Try resetting the subject or year filter, or check the full catalog.</p>
                <button
                  onClick={() => onViewAllPapers(selectedCategory)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer hover:bg-emerald-700 transition-colors"
                >
                  <span>Explore All {PATH_CATEGORIES.find(c => c.id === selectedCategory)?.title} Papers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
