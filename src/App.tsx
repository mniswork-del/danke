import React, { useState, useEffect } from 'react';
import { User, PaperItem, EBookItem, AnswerKeyItem, PaymentRecord, ContentReport, AuditLog } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getAllPapers,
  getAllEBooks,
  getAllAnswerKeys,
  getAllUsers,
  getAllPayments,
  getAllReports,
  getAuditLogs,
  initStorage,
  calculateProfileCompletion,
} from './lib/storage';
import { authApi, paperApi } from './lib/api';

// Component Imports
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PathFinderSection } from './components/PathFinderSection';
import { SearchModal } from './components/SearchModal';
import { PapersCatalogView } from './components/PapersCatalogView';
import { EBooksSection } from './components/EBooksSection';
import { AnswerKeysSection } from './components/AnswerKeysSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SupportSection } from './components/SupportSection';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PaperViewerModal } from './components/PaperViewerModal';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { ReportModal } from './components/ReportModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash.toLowerCase().includes('admin')) {
        return 'admin';
      }
    }
    return 'home';
  });

  // Application Data States
  const [papers, setPapers] = useState<PaperItem[]>(() => getAllPapers());
  const [ebooks, setEbooks] = useState<EBookItem[]>(() => getAllEBooks());
  const [answerKeys, setAnswerKeys] = useState<AnswerKeyItem[]>(() => getAllAnswerKeys());
  const [users, setUsers] = useState<User[]>(() => getAllUsers());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getAllPayments());
  const [reports, setReports] = useState<ContentReport[]>(() => getAllReports());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null);
  const [reportingPaper, setReportingPaper] = useState<PaperItem | null>(null);

  // Initial Selected category from Path Finder
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<any>(null);

  // Sync state from storage and backend
  const refreshAppData = async () => {
    initStorage();
    setPapers(getAllPapers());
    setEbooks(getAllEBooks());
    setAnswerKeys(getAllAnswerKeys());
    setUsers(getAllUsers());
    setPayments(getAllPayments());
    setReports(getAllReports());
    setAuditLogs(getAuditLogs());
    setCurrentUserState(getCurrentUser());

    // Fetch live papers from backend
    try {
      const livePapers = await paperApi.getPapers();
      if (livePapers && livePapers.length > 0) {
        setPapers(livePapers);
      }
    } catch (e) {
      console.warn('Paper fetch note:', e);
    }

    // Verify session
    try {
      const me = await authApi.getMe();
      if (me) {
        const syncedUser: User = {
          id: String(me.id),
          mobile: me.phone_number,
          name: me.profile?.name || me.name || `User ${me.phone_number.slice(-4)}`,
          city: me.profile?.city || '',
          email: me.profile?.email || '',
          profileCompleted: Boolean(me.profile_completed),
          role: 'student',
          status: me.status,
          otpVerified: true,
          uploadedCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          duplicateCount: 0,
          pendingCount: 0,
          totalViews: 0,
          totalDownloads: 0,
          totalEarned: 0,
          pendingPayment: 0,
          totalPaid: 0,
          joinedDate: me.created_at ? new Date(me.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
        setCurrentUser(syncedUser);
        setCurrentUserState(syncedUser);
      }
    } catch {}
  };

  useEffect(() => {
    refreshAppData();

    // Check URL path / hash for /admin navigation
    const checkRoute = () => {
      if (window.location.pathname === '/admin' || window.location.hash.toLowerCase().includes('admin')) {
        setActiveTab('admin');
      }
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Update browser URL hash/pathname cleanly when navigating
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    navigateToTab('home');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    refreshAppData();
    
    // Check if user has incomplete profile details (Name, Email, DOB, Place)
    const stats = calculateProfileCompletion(user);
    if (!stats.isReady) {
      setTimeout(() => {
        setIsProfileCompletionOpen(true);
      }, 400);
    }
  };

  const handleProfileComplete = (user: User) => {
    setCurrentUserState(user);
    refreshAppData();
    setIsProfileCompletionOpen(false);
  };

  const handleUploadSuccess = (paper: PaperItem, isDuplicate: boolean) => {
    refreshAppData();
    if (isDuplicate) {
      alert(`Paper submitted! Note: A paper for this examination already exists in the repository. Your copy has been added to our records.`);
    } else {
      alert(`🎉 Thank you for your contribution! "${paper.title}" has been successfully submitted to the national repository.`);
    }
  };

  const handleFindPapersScroll = () => {
    navigateToTab('home');
    setTimeout(() => {
      const el = document.getElementById('choose-your-path');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCatalogExplore = (category?: any) => {
    setSelectedCatalogCategory(category || null);
    navigateToTab('papers');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfileCompletion={() => setIsProfileCompletionOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => navigateToTab('admin')}
        onOpenUserDashboard={() => navigateToTab('dashboard')}
      />

      {/* Main Content Rendered by Tab */}
      <main className="flex-1">
        {/* Tab 1: Home View */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              onFindPapers={handleFindPapersScroll}
              onUploadAndEarn={() => setIsUploadOpen(true)}
              onSearchFocus={() => setIsSearchOpen(true)}
            />

            {/* Path Finder Section (8 Categories + 5 Steps) */}
            <PathFinderSection
              papers={papers}
              onSelectPaper={p => setSelectedPaper(p)}
              onViewAllPapers={handleCatalogExplore}
            />

            {/* Free E-Books Highlight */}
            <EBooksSection ebooks={ebooks} />

            {/* Answer Keys Section */}
            <AnswerKeysSection
              answerKeys={answerKeys}
              allPapers={papers}
              onSelectPaper={p => setSelectedPaper(p)}
            />

            {/* How It Works Explanation */}
            <HowItWorksSection
              onOpenUpload={() => setIsUploadOpen(true)}
              onFindPapers={handleFindPapersScroll}
            />
          </div>
        )}

        {/* Tab 2: Full Papers Catalog */}
        {activeTab === 'papers' && (
          <PapersCatalogView
            papers={papers}
            initialCategory={selectedCatalogCategory}
            onSelectPaper={p => setSelectedPaper(p)}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {/* Tab 3: Free E-Books */}
        {activeTab === 'ebooks' && (
          <EBooksSection ebooks={ebooks} />
        )}

        {/* Tab 4: Answer Keys */}
        {activeTab === 'answer-keys' && (
          <AnswerKeysSection
            answerKeys={answerKeys}
            allPapers={papers}
            onSelectPaper={p => setSelectedPaper(p)}
          />
        )}

        {/* Tab 5: Support, Helpdesk & How It Works */}
        {(activeTab === 'support' || activeTab === 'how-it-works' || activeTab === 'upload-earn') && (
          <SupportSection
            onOpenUpload={() => setIsUploadOpen(true)}
            onNavigateHome={() => navigateToTab('home')}
            onNavigatePapers={() => navigateToTab('papers')}
          />
        )}

        {/* Tab 7: User Dashboard */}
        {activeTab === 'dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            allPapers={papers}
            allPayments={payments}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectPaper={p => setSelectedPaper(p)}
            onUpdateUser={u => setCurrentUserState(u)}
          />
        )}

        {activeTab === 'dashboard' && !currentUser && (
          <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 font-bold">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Student Dashboard</h2>
            <p className="text-sm text-slate-600 mb-6">
              You are currently browsing as a guest. Please log in or create an account to view your uploaded papers and track contributions.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Login or Register
            </button>
          </div>
        )}

        {/* Tab 8: Admin Panel (/admin) */}
        {activeTab === 'admin' && (
          <AdminPanel
            adminUser={currentUser && currentUser.role === 'admin' ? currentUser : undefined}
            allPapers={papers}
            allUsers={users}
            allPayments={payments}
            allReports={reports}
            auditLogs={auditLogs}
            onRefreshData={refreshAppData}
            onSelectPaper={p => setSelectedPaper(p)}
            onExitAdmin={() => navigateToTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigateToTab}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        papers={papers}
        onSelectPaper={p => setSelectedPaper(p)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfileCompletion={() => setIsProfileCompletionOpen(true)}
        onUploadSuccess={handleUploadSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileCompletionModal
        isOpen={isProfileCompletionOpen}
        onClose={() => setIsProfileCompletionOpen(false)}
        currentUser={currentUser}
        onComplete={handleProfileComplete}
      />

      <PaperViewerModal
        paper={selectedPaper}
        onClose={() => setSelectedPaper(null)}
        onOpenReport={p => setReportingPaper(p)}
        onSelectRelatedPaper={p => setSelectedPaper(p)}
        allPapers={papers}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfileCompletion={() => setIsProfileCompletionOpen(true)}
      />

      <ReportModal
        paper={reportingPaper}
        isOpen={!!reportingPaper}
        onClose={() => setReportingPaper(null)}
      />
    </div>
  );
}
