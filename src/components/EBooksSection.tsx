import React, { useState, useMemo } from 'react';
import { EBookItem, EducationCategory } from '../types';
import { PATH_CATEGORIES } from '../data/categoriesData';
import {
  BookOpen,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Filter,
  X,
  FileText,
} from 'lucide-react';
import { incrementEBookDownload } from '../lib/storage';

interface EBooksSectionProps {
  ebooks: EBookItem[];
}

export const EBooksSection: React.FC<EBooksSectionProps> = ({ ebooks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingBook, setReadingBook] = useState<EBookItem | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return ebooks.filter(book => {
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          book.title.toLowerCase().includes(q) ||
          book.subject.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ebooks, searchQuery, selectedCategory]);

  const handleDownload = (book: EBookItem) => {
    incrementEBookDownload(book.id);
    setDownloadSuccessId(book.id);

    const link = document.createElement('a');
    link.href = book.fileUrl;
    link.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>100% Free Open Educational Library</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free Educational E-Books & Notes
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Official NCERT textbooks, high-yield reference notes, and open academic handbooks.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-3xl mx-auto mb-10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search e-books by title, author, or subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Academic Categories</option>
            {PATH_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div
              key={book.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Book Cover Image & Open Domain Pill */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Free Open Resource</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    {book.subject}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                  {book.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 font-medium">
                  By {book.author}
                </p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  <span>{book.pageCount} Pages</span> • <span>{book.fileSize}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReadingBook(book)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Quick Reader Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownload(book)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadSuccessId === book.id ? 'Downloaded' : 'Free PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* E-Book Quick Reader Modal */}
        {readingBook && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{readingBook.title}</h3>
                  <p className="text-xs text-slate-500">Published by {readingBook.author}</p>
                </div>
                <button
                  onClick={() => setReadingBook(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <BookOpen className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Online Academic Text Preview</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {readingBook.description}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => handleDownload(readingBook)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      Download Complete Book ({readingBook.fileSize})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
