import React, { useState, useEffect } from 'react';
import { User, PaperItem, EducationCategory } from '../types';
import { PATH_CATEGORIES } from '../data/categoriesData';
import {
  GraduationCap,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Building,
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check,
  Heart,
  Eye,
} from 'lucide-react';
import { updateUserProfile, calculateProfileCompletion } from '../lib/storage';
import { profileApi } from '../lib/api';

interface UserDashboardProps {
  currentUser: User;
  allPapers: PaperItem[];
  allPayments?: any[];
  onOpenUpload: () => void;
  onSelectPaper: (paper: PaperItem) => void;
  onUpdateUser: (user: User) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  allPapers,
  onOpenUpload,
  onSelectPaper,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'uploads' | 'profile'>('uploads');

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [place, setPlace] = useState(currentUser.place || currentUser.city || '');
  const [state, setState] = useState(currentUser.state || 'Uttar Pradesh');
  const [category, setCategory] = useState<EducationCategory>(
    (currentUser.educationCategory as EducationCategory) || 'college'
  );
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [course, setCourse] = useState(currentUser.course || '');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setDob(currentUser.dob || '');
      setPlace(currentUser.place || currentUser.city || '');
      setState(currentUser.state || 'Uttar Pradesh');
      setCategory((currentUser.educationCategory as EducationCategory) || 'college');
      setInstitution(currentUser.institution || '');
      setCourse(currentUser.course || '');
    }
  }, [currentUser]);

  // My uploaded papers
  const myPapers = allPapers.filter(p => p.uploaderId === currentUser.id);
  const approvedPapers = myPapers.filter(p => p.status === 'APPROVED');
  const totalViewsHelped = myPapers.reduce((acc, p) => acc + (p.viewsCount || 0), 0);

  const profileStats = calculateProfileCompletion(currentUser);

  const handleSaveFullProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserProfile(currentUser.id, {
      name: fullName.trim() || currentUser.name,
      email: email.trim(),
      dob: dob,
      place: place.trim(),
      city: place.trim(),
      state: state,
      educationCategory: category,
      institution: institution.trim() || 'University / Board',
      course: course.trim() || 'General Studies',
    });
    onUpdateUser(updated);

    try {
      await profileApi.updateProfile({
        name: fullName.trim() || currentUser.name,
        email: email.trim(),
        city: place.trim(),
        address: `${place.trim()}, ${state}`,
        profession: `${course.trim()} at ${institution.trim() || 'University'}`,
      });
    } catch (err) {
      console.warn('Backend profile sync note:', err);
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold capitalize">
                Student Contributor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              +91 {currentUser.mobile} • {currentUser.institution || 'University Student'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {currentUser.course || 'Course Not Specified'} • {currentUser.state || 'India'}
            </p>
          </div>
        </div>

        {/* Community Impact Summary Box */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 flex items-center space-x-6 shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Papers Contributed</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{myPapers.length}</div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-0.5 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{approvedPapers.length} Live in Repository</span>
            </div>
          </div>

          <div className="border-l border-emerald-200/80 pl-5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Students Helped</div>
            <div className="text-2xl sm:text-3xl font-black text-teal-700">{totalViewsHelped}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1">
              <Heart className="w-3 h-3 text-rose-500" />
              <span>100% Free Sharing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'uploads'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Uploaded Papers ({myPapers.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Academic Profile Details
        </button>
      </div>

      {/* Tab 1: Uploads List */}
      {activeTab === 'uploads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Your Contributions</h2>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Paper</span>
            </button>
          </div>

          {myPapers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No question papers uploaded yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Share authentic previous year question papers from your college or school board to help fellow students prepare for exams.
              </p>
              <button
                onClick={onOpenUpload}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Upload First Paper
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-5 py-3.5">Subject & Paper</th>
                      <th className="px-4 py-3.5">Institution</th>
                      <th className="px-4 py-3.5">Year</th>
                      <th className="px-4 py-3.5">Moderation Status</th>
                      <th className="px-4 py-3.5">Community Views</th>
                      <th className="px-4 py-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPapers.map(paper => (
                      <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          <div className="line-clamp-1">{paper.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{paper.course}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{paper.institution}</td>
                        <td className="px-4 py-4 font-bold text-slate-900">{paper.year}</td>
                        <td className="px-4 py-4">
                          {paper.status === 'APPROVED' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Approved & Live</span>
                            </span>
                          )}
                          {paper.status === 'DUPLICATE' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]" title={paper.duplicateReason}>
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Duplicate Match</span>
                            </span>
                          )}
                          {paper.status === 'PENDING_REVIEW' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">
                              <Clock className="w-3 h-3" />
                              <span>In Review</span>
                            </span>
                          )}
                          {paper.status === 'REJECTED' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-700">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{paper.viewsCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => onSelectPaper(paper)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-bold text-xs cursor-pointer transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Academic Profile</h2>
            <p className="text-xs text-slate-500 mt-1">
              Keep your profile up to date to personalize your paper search and verify your uploaded materials.
            </p>
          </div>

          {/* Profile Completion Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Profile Completion</span>
              </span>
              <span className="text-emerald-700 font-black">{profileStats.percent}% Complete</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${profileStats.percent}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSaveFullProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth (DOB) */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Place / City */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Education Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Education Path</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as EducationCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
                >
                  {PATH_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Institution / University / Board */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">University / Board</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="e.g. AKTU, CBSE, Delhi University"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Course / Stream</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={course}
                    onChange={e => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {profileSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>All profile details saved successfully!</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
