import React, { useState, useMemo } from 'react';
import { NoteItem, EducationCategory } from '../types';
import { PATH_CATEGORIES } from '../data/categoriesData';
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
  BookOpen,
  Filter,
  X,
  Share2,
  ThumbsUp,
  GraduationCap,
  Star,
  Layers,
  Upload,
  BookMarked,
  Check
} from 'lucide-react';
import { incrementNoteDownload, incrementNoteView, toggleNoteLike } from '../lib/storage';

interface NotesSectionProps {
  notes: NoteItem[];
  onOpenUpload?: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes, onOpenUpload }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'handwritten' | 'digital'>('all');
  const [readingNote, setReadingNote] = useState<NoteItem | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedNotes, setLikedNotes] = useState<Record<string, number>>({});

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (selectedCategory !== 'all' && note.category !== selectedCategory) {
        return false;
      }
      if (selectedType === 'handwritten' && !note.isHandwritten) {
        return false;
      }
      if (selectedType === 'digital' && note.isHandwritten) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesSubject = note.subject.toLowerCase().includes(q);
        const matchesAuthor = note.author.toLowerCase().includes(q);
        const matchesCourse = note.course.toLowerCase().includes(q);
        const matchesTopics = note.topics && note.topics.some(t => t.toLowerCase().includes(q));
        return matchesTitle || matchesSubject || matchesAuthor || matchesCourse || matchesTopics;
      }
      return true;
    });
  }, [notes, searchQuery, selectedCategory, selectedType]);

  const handleDownload = (note: NoteItem) => {
    incrementNoteDownload(note.id);
    setDownloadSuccessId(note.id);

    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  const handleOpenNote = (note: NoteItem) => {
    incrementNoteView(note.id);
    setReadingNote(note);
  };

  const handleLike = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    const newLikes = toggleNoteLike(noteId);
    setLikedNotes(prev => ({ ...prev, [noteId]: newLikes }));
  };

  const handleShare = (e: React.MouseEvent, note: NoteItem) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/notes?id=${note.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section className="py-10 sm:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Topper Curated • Handwritten & Fast-Revision</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Study Notes & Fast Revision Sheets
            </h1>
            
            <p className="mt-3 text-sm sm:text-lg text-slate-300 font-medium leading-relaxed">
              Access master handwritten notes from university gold-medalists, high-yield NCERT mindmaps, formula cheat sheets, and exam-oriented chapter summaries.
            </p>

            {/* Top Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-700/60">
              <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
                <p className="text-2xl font-black text-white">{notes.length}+</p>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">Master Note Sets</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
                <p className="text-2xl font-black text-amber-400">100%</p>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">Free PDF Downloads</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
                <p className="text-2xl font-black text-emerald-400">4.9 ★</p>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">Student Rating</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
                <p className="text-2xl font-black text-teal-300">50K+</p>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">Happy Learners</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-5 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes by subject, topic (e.g., Trees, Organic Reactions)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category and Format Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Academic Categories</option>
                {PATH_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Format Toggle Pill */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    selectedType === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Format
                </button>
                <button
                  onClick={() => setSelectedType('handwritten')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    selectedType === 'handwritten'
                      ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✍️ Handwritten
                </button>
                <button
                  onClick={() => setSelectedType('digital')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    selectedType === 'digital'
                      ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📄 Digital Summaries
                </button>
              </div>

              {/* Upload Contribution Trigger */}
              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer ml-auto lg:ml-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Share Your Notes</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs p-8 max-w-lg mx-auto">
            <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No notes found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => {
              const currentLikes = likedNotes[note.id] !== undefined ? likedNotes[note.id] : (note.likesCount || 0);

              return (
                <div
                  key={note.id}
                  onClick={() => handleOpenNote(note)}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                >
                  {/* Top Image Preview Banner */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={note.previewImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80'}
                      alt={note.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Format Pill (Handwritten vs Digital) */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        note.isHandwritten
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-teal-500/90 text-white'
                      }`}>
                        {note.isHandwritten ? '✍️ Handwritten' : '📄 Typed Summary'}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-300 text-xs font-black">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{note.rating || 4.9}</span>
                    </div>

                    {/* Bottom Metadata in Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                        {note.subject}
                      </p>
                      <p className="text-xs font-extrabold truncate text-white drop-shadow-sm">
                        {note.course} {note.semester ? `• ${note.semester}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title */}
                      <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                        {note.title}
                      </h3>

                      {/* Author / Topper Badge */}
                      <div className="flex items-center space-x-2 mt-2.5 text-xs text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-[10px]">
                          {note.author.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 truncate">{note.author}</span>
                        {note.authorRole && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/80">
                            {note.authorRole}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {note.description}
                      </p>

                      {/* High Yield Key Topics Chips */}
                      {note.topics && note.topics.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {note.topics.slice(0, 3).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold"
                            >
                              #{topic}
                            </span>
                          ))}
                          {note.topics.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-bold">
                              +{note.topics.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Metrics & Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      
                      {/* Left: Pages & Size */}
                      <div className="flex items-center space-x-2.5 text-[11px] text-slate-500 font-bold">
                        <span>{note.pageCount} Pages</span>
                        <span>•</span>
                        <span>{note.fileSize}</span>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center space-x-1.5">
                        
                        {/* Like Button */}
                        <button
                          onClick={(e) => handleLike(e, note.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center space-x-1 text-xs font-bold"
                          title="Helpful Note"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{currentLikes}</span>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={(e) => handleShare(e, note)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Share Link"
                        >
                          {copiedId === note.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Direct Download Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(note);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs ${
                            downloadSuccessId === note.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {downloadSuccessId === note.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Saved!</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Note Viewer / Reader Modal */}
        {readingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
              
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                      {readingNote.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {readingNote.course} {readingNote.semester ? `• ${readingNote.semester}` : ''}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-white line-clamp-1">
                    {readingNote.title}
                  </h2>
                </div>

                <button
                  onClick={() => setReadingNote(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Document Preview Area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-100 flex flex-col items-center">
                
                {/* Note Details Banner */}
                <div className="w-full max-w-2xl bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                        {readingNote.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{readingNote.author}</p>
                        <p className="text-[11px] text-slate-500">{readingNote.institution || 'Verified Academic Contributor'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
                      <span>📄 {readingNote.pageCount} Pages</span>
                      <span>💾 {readingNote.fileSize}</span>
                      <span className="text-amber-600 font-black">★ {readingNote.rating || 4.9}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
                    {readingNote.description}
                  </p>

                  {/* High Yield Key Topics */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-extrabold text-slate-900 mb-1.5">Topics Covered in this Set:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {readingNote.topics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PDF Page Simulation Preview */}
                <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-10 border border-slate-300 shadow-md min-h-[420px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                      <div>
                        <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase">University Tree Open Knowledge</span>
                        <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{readingNote.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">Page 1 of {readingNote.pageCount}</span>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
                      <p className="font-bold text-slate-900">
                        {readingNote.subject} — Master Lecture Notes & Key Formula Derivations
                      </p>
                      <p className="text-slate-600 italic">
                        Author: {readingNote.author} ({readingNote.authorRole || 'Topper'}) • {readingNote.institution}
                      </p>

                      <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/70 my-4 text-xs font-sans">
                        <p className="font-bold text-emerald-900 mb-1">Quick Syllabus Index:</p>
                        <ul className="list-disc pl-4 space-y-1 text-emerald-800">
                          {readingNote.topics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-slate-600 leading-relaxed font-sans text-xs">
                        This complete study set contains detailed derivations, verified standard definitions, university previous year patterns, and high-scoring exam solutions.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-semibold mb-3">
                      To view and study all {readingNote.pageCount} pages offline, download the verified PDF document below.
                    </p>
                    <button
                      onClick={() => handleDownload(readingNote)}
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 mx-auto cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Full {readingNote.pageCount}-Page PDF ({readingNote.fileSize})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between px-6">
                <span className="text-xs text-slate-500 font-bold">100% Free Open Educational Material</span>
                <button
                  onClick={() => setReadingNote(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
