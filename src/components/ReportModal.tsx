import React, { useState } from 'react';
import { PaperItem } from '../types';
import { X, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { submitContentReport } from '../lib/storage';

interface ReportModalProps {
  paper: PaperItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  paper,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !paper) return null;

  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reason, setReason] = useState<any>('Wrong Subject/Year');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContentReport({
      contentId: paper.id,
      contentTitle: paper.title,
      contentType: 'pyq',
      reporterName: reporterName || 'Anonymous Student',
      reporterEmail: reporterEmail || 'anonymous@student.in',
      reason: reason,
      description: description,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Our academic moderation team will inspect this file within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-black text-slate-900">Report Academic Content</h3>
            </div>
            <p className="text-slate-500">
              Reporting: <span className="font-bold text-slate-800">{paper.title}</span>
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Report *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="Wrong Subject/Year">Wrong Subject, Year, or Course</option>
                <option value="Corrupted/Blank PDF">Corrupted, Incomplete, or Blurry PDF</option>
                <option value="Copyright/DMCA Infringement">Copyright / DMCA Takedown Notice</option>
                <option value="Promotional Watermark">Excessive Promotional Ads / Spam Watermark</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Email (for resolution updates) *</label>
              <input
                type="email"
                value={reporterEmail}
                onChange={e => setReporterEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Describe the Issue *</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe which page has an issue or cite copyright claim..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                required
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
