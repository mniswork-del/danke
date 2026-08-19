import React, { useState, useMemo } from 'react';
import { User, EducationCategory, PaperItem } from '../types';
import { PATH_CATEGORIES, ACADEMIC_DIRECTORY } from '../data/categoriesData';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  Info,
  DollarSign,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { checkForDuplicatePaper, saveUploadedPaper, calculateProfileCompletion } from '../lib/storage';
import { paperApi } from '../lib/api';
import { SAMPLE_PDF_BASE64 } from '../data/mockData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenProfileCompletion?: () => void;
  onUploadSuccess: (paper: PaperItem, isDuplicate: boolean) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onOpenProfileCompletion,
  onUploadSuccess,
}) => {
  if (!isOpen) return null;

  const profileStats = calculateProfileCompletion(currentUser);

  // Form State
  const [category, setCategory] = useState<EducationCategory>('college');
  const [institution, setInstitution] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [examType, setExamType] = useState<PaperItem['examType']>('End-Sem');
  const [language, setLanguage] = useState<PaperItem['language']>('English');
  const [hasSolutions, setHasSolutions] = useState(false);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('question_paper.pdf');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Directory suggestions for chosen category
  const categoryData = useMemo(() => {
    return ACADEMIC_DIRECTORY[category] || null;
  }, [category]);

  const availableInstitutions = useMemo(() => {
    return categoryData ? categoryData.institutions : [];
  }, [categoryData]);

  const effectiveInstitution = institution === 'other' ? customInstitution : institution;
  const effectiveCourse = course === 'other' ? customCourse : course;
  const effectiveSubject = subject === 'other' ? customSubject : subject;

  // Real-time Duplicate Check Analysis
  const duplicateCheck = useMemo(() => {
    if (!effectiveInstitution || !effectiveSubject || !year) {
      return null;
    }
    return checkForDuplicatePaper({
      institution: effectiveInstitution,
      course: effectiveCourse || 'General',
      subject: effectiveSubject,
      year: Number(year),
      semester: semester,
    });
  }, [effectiveInstitution, effectiveCourse, effectiveSubject, year, semester]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!effectiveInstitution.trim() || !effectiveSubject.trim()) {
      alert('Please provide valid Institution and Subject details.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', `${effectiveSubject} - ${effectiveInstitution} (${year})`);
        formData.append('paper_type_id', '1'); // PYQ default
        formData.append('subject_id', '1'); // Generic Subject ID
        formData.append('paper_year_id', '1'); // Exam Year ID
        formData.append('year', String(year));

        await paperApi.uploadPaper(formData);
      }
    } catch (uploadErr) {
      console.warn('Backend paper upload note:', uploadErr);
    }

    const { paper, duplicateResult } = saveUploadedPaper({
      category,
      institution: effectiveInstitution,
      board: effectiveInstitution,
      course: effectiveCourse || 'Standard Course',
      semester: semester,
      subject: effectiveSubject,
      subjectCode: subjectCode,
      year: Number(year),
      examType: examType,
      language: language,
      title: `${effectiveSubject} - ${effectiveInstitution} (${year})`,
      description: description || `Uploaded by ${currentUser.name} for ${effectiveInstitution} students.`,
      fileUrl: SAMPLE_PDF_BASE64,
      fileName: fileName,
      fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB',
      pageCount: 6,
      hasSolutions: hasSolutions,
      uploader: currentUser,
    });

    setIsSubmitting(false);
    onUploadSuccess(paper, duplicateResult.isDuplicate);
    onClose();
  };

  // If user is not logged in, prompt registration first
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-slate-900">Upload & Share Question Papers</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Join the community to share previous year question papers and help fellow students across India prepare for exams.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Login / Register with Mobile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user profile is not complete (requires Name, Email, DOB, Place)
  if (!profileStats.isReady) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-slate-900">Complete Your Profile First</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your profile is currently <span className="font-bold text-amber-700">{profileStats.percent}% complete</span>. Please fill in your basic details (Full Name, Email, DOB, Place) to activate verified paper submissions.
          </p>

          {/* Mini progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden my-4">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${profileStats.percent}%` }}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenProfileCompletion) onOpenProfileCompletion();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Complete Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Upload & Share Paper</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-2xs">
                Free Community Contribution
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Help fellow Indian students by contributing clean, authentic previous year exam papers.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Duplicate Detection Alert Feedback */}
          {duplicateCheck && duplicateCheck.isDuplicate && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900">Duplicate Examination Detected</div>
                <div className="mt-0.5 text-amber-800 leading-relaxed">
                  {duplicateCheck.reason}
                </div>
                <div className="mt-1.5 text-[11px] font-medium text-amber-700">
                  Note: A paper for this examination already exists in the repository. You may still submit if your copy is higher resolution or includes solved solutions.
                </div>
              </div>
            </div>
          )}

          {duplicateCheck && !duplicateCheck.isDuplicate && effectiveInstitution && effectiveSubject && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Unique Paper Confirmed! Eligible for ₹5 Creator Reward upon quick verification.
              </span>
            </div>
          )}

          {/* 1. Education Category & Institution Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Education Level / Category *
              </label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value as EducationCategory);
                  setInstitution('');
                  setCourse('');
                  setSubject('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                required
              >
                {PATH_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Board / University / Organization *
              </label>
              <select
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                required
              >
                <option value="">-- Choose Board or University --</option>
                {availableInstitutions.map(i => (
                  <option key={i.name} value={i.name}>
                    {i.name}
                  </option>
                ))}
                <option value="other">Other (Enter Manually)</option>
              </select>
            </div>
          </div>

          {institution === 'other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Enter University / Board Name Manually *
              </label>
              <input
                type="text"
                value={customInstitution}
                onChange={e => setCustomInstitution(e.target.value)}
                placeholder="e.g. Mumbai University, RTU Kota, BTEUP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                required
              />
            </div>
          )}

          {/* 2. Course, Semester & Subject Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Course / Program / Class *
              </label>
              <input
                type="text"
                value={course}
                onChange={e => setCourse(e.target.value)}
                placeholder="e.g. B.Tech CSE, Class 12, BA, UPSC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Subject Name *
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems, Physics, Maths"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Subject Code (Optional)
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={e => setSubjectCode(e.target.value)}
                placeholder="e.g. KCS501, PH-101"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 3. Year, Exam Type & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Examination Year *
              </label>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
                <option value={2021}>2021</option>
                <option value={2020}>2020</option>
                <option value={2019}>2019</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={e => setExamType(e.target.value as PaperItem['examType'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              >
                <option value="End-Sem">End-Semester Regular</option>
                <option value="Mid-Sem">Mid-Semester / Sessional</option>
                <option value="Board-Final">Board Annual Final</option>
                <option value="Entrance">Entrance Exam</option>
                <option value="Prelims">Prelims / Tier 1</option>
                <option value="Mains">Mains / Tier 2</option>
                <option value="Supplementary">Back paper / Supplementary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Question Paper Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as PaperItem['language'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bilingual">Bilingual (English + Hindi)</option>
                <option value="Regional">Regional Language</option>
              </select>
            </div>
          </div>

          {/* 4. PDF File Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Upload Question Paper (PDF / Image scans) *
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50 hover:bg-emerald-50/20 transition-all">
              <input
                type="file"
                id="paper-file-input"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="paper-file-input" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {file ? file.name : 'Click to browse or drop PDF here'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: PDF, JPG, PNG • Max size: 25 MB
                </p>
              </label>
            </div>
          </div>

          {/* 5. Answer Key Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Does this paper include Answer Key / Solutions?</div>
              <div className="text-[11px] text-slate-500">Helping students find verified answers increases views and downloads.</div>
            </div>
            <input
              type="checkbox"
              checked={hasSolutions}
              onChange={e => setHasSolutions(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* 6. Terms & Authenticity Declaration */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-start space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={e => setIsTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 shrink-0 mt-0.5 cursor-pointer"
                required
              />
              <span>
                I confirm that this is an authentic, readable previous year examination paper uploaded for educational reference, and I agree to the platform's contribution guidelines.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isTermsAccepted || isSubmitting}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying & Submitting...' : 'Submit & Share Paper'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
