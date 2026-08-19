import React from 'react';

interface HowItWorksSectionProps {
  onOpenUpload: () => void;
  onFindPapers: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onOpenUpload,
  onFindPapers,
}) => {
  return (
    <section id="how-it-works-section" className="py-10 sm:py-14 bg-gradient-to-b from-white via-slate-50/40 to-white border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-black mb-3 shadow-2xs">
            <span>100% Free Open Educational Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How University Tree Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            A community-driven open platform connecting students with authentic previous year exam papers, shared freely by students and educators across India.
          </p>
        </div>

        {/* 2 Main Streams: For Students & For Contributors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mb-8">
          
          {/* Column 1: For Students & Learners */}
          <div className="relative rounded-2xl bg-white border border-emerald-200 p-5 sm:p-6 shadow-md shadow-emerald-950/5 hover:border-emerald-400 transition-all flex flex-col justify-between overflow-hidden">
            {/* Top Accent Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/40 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

            <div>
              {/* Header Banner */}
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Step 1 • Student Hub
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5">
                  For Students & Learners
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  100% Free search, full-page preview & high-res PDF downloads
                </p>
              </div>

              {/* 3 Step Flow with Clean Numbers */}
              <div className="space-y-2.5">
                
                {/* Sub Step 1 */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Select Your Academic Path</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                      Choose from CBSE, AKTU, DU, UP Board, NEET UG, JEE Main, or UPSC Govt exams.
                    </p>
                  </div>
                </div>

                {/* Sub Step 2 */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Filter Course, Subject & Year</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                      Narrow down by Semester, Branch, Paper Code, and Year (2020–2025) with verified answer keys.
                    </p>
                  </div>
                </div>

                {/* Sub Step 3 */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Instant Readable PDF Downloads</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                      Crystal-clear scanned original papers, marking schemes, and free syllabus with zero paywalls.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-[11px] font-bold text-emerald-800">
                • No fees or subscriptions required
              </div>

              <button
                onClick={onFindPapers}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs flex items-center justify-center shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>Explore Question Papers</span>
              </button>
            </div>
          </div>

          {/* Column 2: For Uploaders & Community Contributors */}
          <div className="relative rounded-2xl bg-white border border-teal-200 p-5 sm:p-6 shadow-md shadow-teal-950/5 hover:border-teal-400 transition-all flex flex-col justify-between overflow-hidden">
            {/* Top Accent Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-teal-100/40 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

            <div>
              {/* Header Banner */}
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Step 2 • Community Contributors
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5">
                  For Uploaders & Contributors
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Share question papers and help thousands of students prepare
                </p>
              </div>

              {/* 3 Step Flow with Clean Numbers */}
              <div className="space-y-2.5">
                
                {/* Sub Step 1 */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 hover:bg-teal-50/40 hover:border-teal-200 transition-all flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs shrink-0 border border-teal-200 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Upload Exam Papers & Solved Keys</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                      Snap clear photos or upload PDF scans of mid-term, end-sem, or board question papers.
                    </p>
                  </div>
                </div>

                {/* Sub Step 2 */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 hover:bg-teal-50/40 hover:border-teal-200 transition-all flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs shrink-0 border border-teal-200 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Quality Check & Moderation</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                      Our system and admin moderators ensure papers are legible and properly categorized for easy discovery.
                    </p>
                  </div>
                </div>

                {/* Sub Step 3 */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 hover:bg-teal-50/40 hover:border-teal-200 transition-all flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Published Live for the Community</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                      Your contribution goes live instantly in the national open repository, helping learners excel in their exams.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-[11px] font-bold text-teal-800">
                • 100% Free Open Academic Sharing
              </div>

              <button
                onClick={onOpenUpload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-98 text-white font-black text-xs flex items-center justify-center shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <span>Upload Paper</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

