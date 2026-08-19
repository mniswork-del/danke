import React, { useState, useEffect } from 'react';
import {
  User,
  PaperItem,
  ContentReport,
  AuditLog,
} from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  FileCheck,
  RotateCcw,
  Search,
  Eye,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Lock,
  LogOut,
  KeyRound,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  updatePaperStatus,
  overrideDuplicatePaper,
  deletePaperByAdmin,
  updateReportStatus,
  toggleUserSuspension,
} from '../lib/storage';
import { adminApi, getAdminToken } from '../lib/api';

interface AdminPanelProps {
  adminUser?: User | null;
  allPapers: PaperItem[];
  allUsers: User[];
  allPayments?: any[];
  allReports: ContentReport[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
  onSelectPaper: (paper: PaperItem) => void;
  onExitAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  allPapers,
  allUsers,
  allReports,
  auditLogs,
  onRefreshData,
  onSelectPaper,
  onExitAdmin,
}) => {
  // Admin Login Authentication Gate
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('universitytree_admin_auth') === 'true';
    }
    return false;
  });

  // Login Form States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'users' | 'audit'>('moderation');
  const [searchQuery, setSearchQuery] = useState('');

  // Override Duplicate Modal State
  const [overridePaper, setOverridePaper] = useState<PaperItem | null>(null);
  const [overrideNote, setOverrideNote] = useState('Verified higher scan clarity & distinct solutions.');

  // Reject Modal State
  const [rejectPaper, setRejectPaper] = useState<PaperItem | null>(null);
  const [rejectReason, setRejectReason] = useState('Blurry or unreadable pages');

  // Effective Admin User Profile for audit logs
  const effectiveAdminUser: User = adminUser || {
    id: 'admin-root',
    mobile: '9999999999',
    name: 'University Tree Administrator',
    email: 'admin@universitytree.in',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isVerified: true,
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === 'Admin98@') {
        try {
          await adminApi.login('admin', 'Admin98@');
        } catch (apiErr) {
          console.warn('Backend admin login note:', apiErr);
        }
        sessionStorage.setItem('universitytree_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        setAuthError('');
      } else {
        // Try real backend
        const res = await adminApi.login(adminUsername.trim(), adminPassword);
        if (res && res.success) {
          sessionStorage.setItem('universitytree_admin_auth', 'true');
          setIsAdminAuthenticated(true);
          setAuthError('');
        } else {
          setAuthError('Invalid administrator credentials. Access denied.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid administrator credentials. Access denied.');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await adminApi.logout();
    } catch {}
    sessionStorage.removeItem('universitytree_admin_auth');
    setIsAdminAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
    if (onExitAdmin) {
      onExitAdmin();
    }
  };

  // Moderation handlers
  const handleApprovePaper = (paper: PaperItem) => {
    updatePaperStatus(paper.id, 'APPROVED', effectiveAdminUser);
    onRefreshData();
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPaper) return;
    try {
      await adminApi.rejectPaper(rejectPaper.id, rejectReason);
    } catch (err) {
      console.warn('Backend reject paper note:', err);
    }
    updatePaperStatus(rejectPaper.id, 'REJECTED', effectiveAdminUser, rejectReason);
    setRejectPaper(null);
    onRefreshData();
  };

  const handleConfirmOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overridePaper) return;
    overrideDuplicatePaper(overridePaper.id, effectiveAdminUser, overrideNote);
    setOverridePaper(null);
    onRefreshData();
  };

  const handleDeletePaper = (paper: PaperItem) => {
    const reason = prompt(`Enter reason for deleting "${paper.title}":`, 'Violates contribution policy / copyright infringement');
    if (reason) {
      deletePaperByAdmin(paper.id, effectiveAdminUser, reason);
      onRefreshData();
    }
  };

  const handleToggleSuspend = async (user: User) => {
    try {
      if (user.status === 'suspended') {
        await adminApi.activateUser(user.id);
      } else {
        await adminApi.suspendUser(user.id);
      }
    } catch (err) {
      console.warn('Backend suspend user note:', err);
    }
    toggleUserSuspension(user.id, effectiveAdminUser);
    onRefreshData();
  };

  // Filtered lists
  const pendingPapers = allPapers.filter(p => p.status === 'PENDING_REVIEW' || p.status === 'DUPLICATE');
  const pendingReportsCount = allReports.filter(r => r.status === 'PENDING').length;

  const filteredPapers = allPapers.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.institution.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.uploaderName.toLowerCase().includes(q)
    );
  });

  // If not authenticated as Admin, show dedicated login screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-bold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Restricted Access (/admin)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Please sign in with administrator credentials to manage papers, review student submissions, and view security audit logs.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-98 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="mt-5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Main Website
            </button>
          )}
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Admin Moderation Console</h1>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                /admin active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Repository management, paper moderation, copyright reports, and user access control.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin Active (admin)</span>
          </span>

          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 rounded-full border border-slate-300 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Lock Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Exit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Total Papers in System</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{allPapers.length}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">{allPapers.filter(p => p.status === 'APPROVED').length} Public & Live</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingPapers.length}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Awaiting moderation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Pending Content Reports</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{pendingReportsCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">DMCA / Quality flags</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Registered Students</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{allUsers.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Community Contributors</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'moderation' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Paper Moderation & Review ({allPapers.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'reports' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Reports & DMCA ({allReports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'users' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Accounts ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audit' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Trail Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, subject, college, or uploader..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Showing {filteredPapers.length} of {allPapers.length} papers
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Title & Institution</th>
                    <th className="px-4 py-3.5">Uploader</th>
                    <th className="px-4 py-3.5">Year</th>
                    <th className="px-4 py-3.5">Status & Flags</th>
                    <th className="px-4 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPapers.map(paper => (
                    <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        <div className="line-clamp-1">{paper.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{paper.institution} • {paper.subject}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <div>{paper.uploaderName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">+91 {paper.uploaderMobile}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{paper.year}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          paper.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          paper.status === 'DUPLICATE' ? 'bg-amber-100 text-amber-800' :
                          paper.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {paper.status}
                        </span>
                        {paper.duplicateReason && (
                          <div className="text-[10px] text-amber-700 mt-1 line-clamp-1 max-w-[200px]" title={paper.duplicateReason}>
                            {paper.duplicateReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onSelectPaper(paper)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          View
                        </button>

                        {paper.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprovePaper(paper)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {paper.status === 'DUPLICATE' && (
                          <button
                            onClick={() => setOverridePaper(paper)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Override Dup
                          </button>
                        )}

                        {paper.status !== 'REJECTED' && (
                          <button
                            onClick={() => setRejectPaper(paper)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] cursor-pointer"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePaper(paper)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer inline-flex items-center"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reports & DMCA */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          {allReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No content reports filed</p>
              <p className="text-xs text-slate-400">All student papers comply with community guidelines.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Report Type</th>
                    <th className="px-4 py-3.5">Paper Reference</th>
                    <th className="px-4 py-3.5">Reason & Description</th>
                    <th className="px-4 py-3.5">Reporter</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allReports.map(report => (
                    <tr key={report.id}>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                          {report.reportType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-mono text-[11px]">{report.paperId}</td>
                      <td className="px-4 py-4 text-slate-700 max-w-xs">{report.description}</td>
                      <td className="px-4 py-4 text-slate-500">{report.reporterEmail}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        {report.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              updateReportStatus(report.id, 'RESOLVED', 'Reviewed by admin and cleared.');
                              onRefreshData();
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Accounts */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Mobile</th>
                  <th className="px-4 py-3.5">Institution / Course</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-900 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{user.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-mono">+91 {user.mobile}</td>
                    <td className="px-4 py-4 text-slate-600">
                      <div>{user.institution || 'University Student'}</div>
                      <div className="text-[11px] text-slate-400">{user.course || 'General'}</div>
                    </td>
                    <td className="px-4 py-4 font-bold capitalize text-slate-700">{user.role}</td>
                    <td className="px-4 py-4">
                      {user.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleToggleSuspend(user)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          user.isSuspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {user.isSuspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase">Platform Security Audit Log</h3>
            <span className="text-xs text-slate-500 font-mono">{auditLogs.length} Events Recorded</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto font-mono text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start space-x-3">
                <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-purple-700 mr-2">[{log.action}]</span>
                  <span className="text-slate-800">{log.details}</span>
                  <span className="text-slate-400 ml-2">by {log.performedByName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Override Duplicate */}
      {overridePaper && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Override Duplicate Flag</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are approving <strong>{overridePaper.title}</strong> despite automatic similarity flags. Please provide reason:
            </p>
            <textarea
              value={overrideNote}
              onChange={e => setOverrideNote(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-amber-500"
              required
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setOverridePaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOverride}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Paper */}
      {rejectPaper && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Reject Paper Submission</h3>
            </div>
            <p className="text-xs text-slate-600">
              State reason for rejecting <strong>{rejectPaper.title}</strong>:
            </p>
            <select
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
            >
              <option value="Blurry or unreadable pages">Blurry or unreadable scan pages</option>
              <option value="Missing questions / incomplete paper">Missing questions / incomplete paper</option>
              <option value="Incorrect institution / course tag">Incorrect institution / course tag</option>
              <option value="Copyrighted textbook or non-exam content">Copyrighted textbook or non-exam content</option>
              <option value="Spam / Advertisements">Spam / Advertisements</option>
            </select>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectPaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
