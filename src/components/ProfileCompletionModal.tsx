import React, { useState, useEffect, useMemo } from 'react';
import { User, EducationCategory } from '../types';
import { PATH_CATEGORIES, ACADEMIC_DIRECTORY } from '../data/categoriesData';
import {
  X,
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  Building,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Briefcase,
} from 'lucide-react';
import { updateUserProfile, calculateProfileCompletion } from '../lib/storage';
import { profileApi } from '../lib/api';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProfileUpdated?: (updatedUser: User) => void;
  onComplete?: (updatedUser: User) => void;
  actionReason?: 'upload' | 'download' | 'general';
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onComplete,
  actionReason = 'general',
}) => {
  if (!isOpen || !currentUser) return null;

  const [fullName, setFullName] = useState(
    currentUser.name && !currentUser.name.startsWith('Student ') ? currentUser.name : ''
  );
  const [email, setEmail] = useState(currentUser.email || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [place, setPlace] = useState(currentUser.place || currentUser.city || '');
  const [state, setState] = useState(currentUser.state || 'Uttar Pradesh');
  const [category, setCategory] = useState<EducationCategory>(
    (currentUser.educationCategory as EducationCategory) || 'college'
  );
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [course, setCourse] = useState(currentUser.course || '');
  const [payoutUpiId, setPayoutUpiId] = useState(currentUser.payoutUpiId || '');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(
        currentUser.name || ''
      );
      setEmail(currentUser.email || '');
      setDob(currentUser.dob || '');
      setPlace(currentUser.place || currentUser.city || '');
      setState(currentUser.state || 'Uttar Pradesh');
      setCategory((currentUser.educationCategory as EducationCategory) || 'college');
      setInstitution(currentUser.institution || '');
      setCourse(currentUser.course || '');
      setPayoutUpiId(currentUser.payoutUpiId || '');
    }
  }, [currentUser, isOpen]);

  const indianStates = [
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
    'Telangana',
    'Andhra Pradesh',
    'Odisha',
    'Haryana',
    'Uttarakhand',
    'Jharkhand',
    'Assam',
    'Other State',
  ];

  // Dynamic calculation for the current form values in real time
  const liveStats = useMemo(() => {
    const mock: User = {
      ...currentUser,
      name: fullName,
      email: email,
      dob: dob,
      place: place,
      city: place,
      institution: institution,
    };
    return calculateProfileCompletion(mock);
  }, [currentUser, fullName, email, dob, place, institution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      alert('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!place.trim()) {
      alert('Please enter your city / place.');
      return;
    }

    setIsSaving(true);

    const updated = updateUserProfile(currentUser.id, {
      name: fullName.trim(),
      email: email.trim(),
      dob: dob || '2000-01-01',
      place: place.trim(),
      city: place.trim(),
      state: state,
      educationCategory: category,
      institution: institution.trim() || 'University / Board',
      course: course.trim() || 'General Studies',
      payoutUpiId: payoutUpiId.trim() || `${currentUser.mobile}@upi`,
      payoutAccountName: fullName.trim(),
    });

    if (typeof onProfileUpdated === 'function') {
      onProfileUpdated(updated);
    }
    if (typeof onComplete === 'function') {
      onComplete(updated);
    }
    setIsSavedSuccess(true);

    try {
      // Send direct update to Hostinger MySQL profile table with phone number fallback & token
      await profileApi.updateProfile({
        name: fullName.trim(),
        profession: course.trim() || 'Student',
        address: `${place.trim()}, ${state}`,
        city: place.trim(),
        email: email.trim(),
        phone_number: currentUser.mobile,
      } as any);
    } catch (apiErr) {
      console.warn('Backend profile update note:', apiErr);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setIsSavedSuccess(false);
        onClose();
      }, 600);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'from-emerald-500 to-emerald-600';
    if (percent >= 70) return 'from-emerald-400 to-emerald-500';
    if (percent >= 40) return 'from-amber-400 to-amber-500';
    return 'from-orange-500 to-rose-500';
  };

  return (
    <div
      id="profile-completion-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          id="close-profile-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Reason Context */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Profile Verification</span>
            </span>
            {actionReason === 'upload' && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
                Required for Upload & ₹5 Rewards
              </span>
            )}
            {actionReason === 'download' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                Required for Free PDF Downloads
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Complete Your Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill your essential academic details (Name, Email, DOB & Place) to unlock full upload and download access.
          </p>

          {/* Real-time Completion Progress Bar */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-black mb-2">
              <span className="text-slate-700 flex items-center space-x-1.5">
                <span>Profile Completion:</span>
                <span className="text-slate-900 font-extrabold">{liveStats.percent}%</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                liveStats.percent === 100 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {liveStats.percent === 100 ? '✅ Ready to Upload & Download' : `${100 - liveStats.percent}% Remaining`}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden relative">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(liveStats.percent)} transition-all duration-500`}
                style={{ width: `${liveStats.percent}%` }}
              />
            </div>

            {/* Checklist pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[11px]">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Mobile (+91 {currentUser.mobile.slice(-4)})</span>
              </div>
              <div className={`flex items-center space-x-1.5 font-bold ${fullName.trim().length >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {fullName.trim().length >= 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                <span>Full Name (20%)</span>
              </div>
              <div className={`flex items-center space-x-1.5 font-bold ${email.includes('@') ? 'text-emerald-700' : 'text-slate-400'}`}>
                {email.includes('@') ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                <span>Email Address (20%)</span>
              </div>
              <div className={`flex items-center space-x-1.5 font-bold ${dob ? 'text-emerald-700' : 'text-slate-400'}`}>
                {dob ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                <span>Date of Birth (15%)</span>
              </div>
              <div className={`flex items-center space-x-1.5 font-bold ${place.trim() ? 'text-emerald-700' : 'text-slate-400'}`}>
                {place.trim() ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                <span>City & Place (15%)</span>
              </div>
              <div className={`flex items-center space-x-1.5 font-bold ${institution.trim() ? 'text-emerald-700' : 'text-slate-400'}`}>
                {institution.trim() ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                <span>College/Board (10%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white bg-slate-50 transition-all"
                  required
                />
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white bg-slate-50 transition-all"
                  required
                />
              </div>
            </div>

            {/* 3. Date of Birth (DOB) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date of Birth (DOB) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white bg-slate-50 transition-all"
                  required
                />
              </div>
            </div>

            {/* 4. Place / City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City / Place / Town <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  placeholder="e.g. Lucknow, Varanasi, Pune"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white bg-slate-50 transition-all"
                  required
                />
              </div>
            </div>

            {/* 5. State Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State / Region
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 bg-slate-50"
              >
                {indianStates.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Education Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Education Level / Path
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EducationCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 bg-slate-50"
              >
                {PATH_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. College / University / School Board */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                University / College / School Board
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. AKTU, Delhi University, CBSE, SPPU"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 bg-slate-50"
                />
              </div>
            </div>

            {/* 8. Course / Class / Target Exam */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Course / Stream / Class
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech CSE, Class 12, MBBS, BCA"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* 9. UPI ID for ₹5 Upload Rewards (Optional) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payout UPI ID <span className="text-slate-400 font-normal">(for earning ₹5 per approved paper)</span>
            </label>
            <div className="relative">
              <Wallet className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={payoutUpiId}
                onChange={e => setPayoutUpiId(e.target.value)}
                placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Success Banner */}
          {isSavedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile successfully verified & updated! You are now ready to Upload and Download.</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-profile-btn"
              disabled={isSaving}
              className={`px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer ${
                isSaving ? 'opacity-75 cursor-wait' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Verify Profile ({liveStats.percent}%)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
