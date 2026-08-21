import React, { useState, useEffect } from 'react';
import { User, PaperItem, EBookItem, AnswerKeyItem, NoteItem, PaymentRecord, ContentReport, AuditLog } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getAllPapers,
  getAllEBooks,
  getAllAnswerKeys,
  getAllNotes,
  getAllUsers,
  getAllPayments,
  getAllReports,
  getAuditLogs,
  initStorage,
  calculateProfileCompletion,
} from './lib/storage';
import { authApi, paperApi, profileApi } from './lib/api';
import {
  getUserFromFirestore,
  getPapersFromFirestore,
  subscribeToOnlinePapers,
  subscribeToOnlineUser,
} from './lib/firestoreService';

// Component Imports
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PathFinderSection } from './components/PathFinderSection';
import { SearchModal } from './components/SearchModal';
import { PapersCatalogView } from './components/PapersCatalogView';
import { NotesSection } from './components/NotesSection';
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

// Helper to extract tab and target item from current URL
const getRouteFromUrl = () => {
  if (typeof window === 'undefined') return { tab: 'home', paperId: null, category: null };
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const searchParams = new URLSearchParams(window.location.search);

  let paperId = searchParams.get('id') || searchParams.get('paper') || null;
  const category = searchParams.get('category') || null;

  // Check direct URL like /paper/123 or /papers/123
  const paperPathMatch = path.match(/^\/papers?\/([a-zA-Z0-9_-]+)/);
  if (paperPathMatch && paperPathMatch[1] && !['list', 'types', 'upload', 'view'].includes(paperPathMatch[1])) {
    paperId = paperPathMatch[1];
  }

  if (path.startsWith('/admin') || hash.startsWith('admin')) {
    return { tab: 'admin', paperId, category };
  }
  if (path.startsWith('/papers') || path.startsWith('/paper') || path.startsWith('/question-papers') || hash.startsWith('papers') || hash.startsWith('paper')) {
    return { tab: 'papers', paperId, category };
  }
  if (path.startsWith('/notes') || path.startsWith('/note') || hash.startsWith('notes') || hash.startsWith('note')) {
    return { tab: 'notes', paperId, category };
  }
  if (path.startsWith('/ebooks') || path.startsWith('/ebook') || hash.startsWith('ebooks') || hash.startsWith('ebook')) {
    return { tab: 'ebooks', paperId, category };
  }
  if (path.startsWith('/answer-keys') || path.startsWith('/answerkeys') || path.startsWith('/solutions') || hash.startsWith('answer-keys') || hash.startsWith('answerkeys')) {
    return { tab: 'answer-keys', paperId, category };
  }
  if (path.startsWith('/support') || path.startsWith('/help') || path.startsWith('/guide') || path.startsWith('/contact') || hash.startsWith('support') || hash.startsWith('help')) {
    return { tab: 'support', paperId, category };
  }
  if (path.startsWith('/how-it-works') || hash.startsWith('how-it-works')) {
    return { tab: 'how-it-works', paperId, category };
  }
  if (path.startsWith('/dashboard') || path.startsWith('/profile') || path.startsWith('/my-uploads') || path.startsWith('/my-account') || hash.startsWith('dashboard') || hash.startsWith('profile')[...]
    return { tab: 'dashboard', paperId, category };
  }

  return { tab: 'home', paperId, category };
};

const getUrlForTab = (tab: string, paperId?: string | null, category?: string | null) => {
  if (tab === 'papers') {
    if (paperId) return `/papers?id=${encodeURIComponent(paperId)}`;
    if (category) return `/papers?category=${encodeURIComponent(category)}`;
    return '/papers';
  }
  if (tab === 'notes') return '/notes';
  if (tab === 'ebooks') return '/ebooks';
  if (tab === 'answer-keys') return '/answer-keys';
  if (tab === 'support') return '/support';
  if (tab === 'how-it-works') return '/how-it-works';
  if (tab === 'dashboard') return '/dashboard';
  if (tab === 'admin') return '/admin';
  return '/';
};

export default function App() {
  const initialRoute = getRouteFromUrl();
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>(initialRoute.tab);

  // Application Data States
  const [papers, setPapers] = useState<PaperItem[]>(() => getAllPapers());
  const [notes, setNotes] = useState<NoteItem[]>(() => getAllNotes());
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
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<any>(initialRoute.category);

  // Sync state from storage and backend
  const refreshAppData = async () => {
    initStorage();
    setPapers(getAllPapers());
    setNotes(getAllNotes());
    setEbooks(getAllEBooks());
    setAnswerKeys(getAllAnswerKeys());
    setUsers(getAllUsers());
    setPayments(getAllPayments());
    setReports(getAllReports());
    setAuditLogs(getAuditLogs());
    setCurrentUserState(getCurrentUser());

    // Fetch live papers from backend & Firestore Cloud Database
    try {
      const cloudPapers = await getPapersFromFirestore();
      if (cloudPapers && cloudPapers.length > 0) {
        const localPapers = getAllPapers();
        const mergedMap = new Map<string, PaperItem>();
        localPapers.forEach(p => mergedMap.set(p.id, p));
        cloudPapers.forEach(p => mergedMap.set(p.id, p));
        const mergedList = Array.from(mergedMap.values());
        setPapers(mergedList);
      }
    } catch (e) {
      console.warn('Firestore cloud papers fetch note:', e);
    }

    // Sync online Firestore profile for logged in user
    const activeLocalUser = getCurrentUser();
    if (activeLocalUser?.mobile) {
      try {
        const cloudUser = await getUserFromFirestore(activeLocalUser.mobile);
        if (cloudUser) {
          const merged: User = {
            ...activeLocalUser,
            ...cloudUser,
            name: (cloudUser.name && !cloudUser.name.startsWith('Student ') && !cloudUser.name.startsWith('User '))
              ? cloudUser.name
              : (activeLocalUser.name || cloudUser.name),
            profileCompleted: Boolean(cloudUser.profileCompleted || (cloudUser.name && !cloudUser.name.startsWith('Student ') && !cloudUser.name.startsWith('User '))),
            profileCompletionPercent: typeof cloudUser.profileCompletionPercent === 'number'
              ? cloudUser.profileCompletionPercent
              : (cloudUser.profileCompleted ? 100 : activeLocalUser.profileCompletionPercent),
          };
          setCurrentUser(merged);
          setCurrentUserState(merged);
        }
      } catch (err) {
        console.warn('Firestore user profile sync note:', err);
      }
    }

    // Verify session
    try {
      const me = await authApi.getMe();
      if (me) {
        const localCurrent = getCurrentUser();
        const isGeneric = (n?: string) => !n || n.trim().startsWith('User ') || n.trim().startsWith('Student ');
        const resolvedName = !isGeneric(me.profile?.name)
          ? me.profile.name
          : (!isGeneric(localCurrent?.name) ? localCurrent?.name : (me.name || localCurrent?.name || `User ${me.phone_number.slice(-4)}`));

        const syncedUser: User = {
          ...(localCurrent || {}),
          id: String(me.id || localCurrent?.id || Date.now()),
          mobile: me.phone_number || localCurrent?.mobile || '',
          name: resolvedName,
          city: me.profile?.city || localCurrent?.city || localCurrent?.place || '',
          place: me.profile?.city || localCurrent?.place || localCurrent?.city || '',
          email: me.profile?.email || localCurrent?.email || '',
          dob: localCurrent?.dob || '',
          state: localCurrent?.state || 'Uttar Pradesh',
          educationCategory: localCurrent?.educationCategory || 'college',
          institution: localCurrent?.institution || (me.profile?.profession ? me.profile.profession : ''),
          course: localCurrent?.course || (me.profile?.profession ? me.profile.profession : ''),
          payoutUpiId: localCurrent?.payoutUpiId || '',
          payoutAccountName: localCurrent?.payoutAccountName || resolvedName,
          profileCompleted: Boolean(me.profile_completed) || Boolean(localCurrent?.profileCompleted),
          role: 'student',
          status: me.status || 'active',
          otpVerified: true,
          uploadedCount: localCurrent?.uploadedCount || 0,
          approvedCount: localCurrent?.approvedCount || 0,
          rejectedCount: localCurrent?.rejectedCount || 0,
          duplicateCount: localCurrent?.duplicateCount || 0,
          pendingCount: localCurrent?.pendingCount || 0,
          totalViews: localCurrent?.totalViews || 0,
          totalDownloads: localCurrent?.totalDownloads || 0,
          totalEarned: localCurrent?.totalEarned || 0,
          pendingPayment: localCurrent?.pendingPayment || 0,
          totalPaid: localCurrent?.totalPaid || 0,
          joinedDate: me.created_at ? new Date(me.created_at).toISOString().split('T')[0] : (localCurrent?.joinedDate || new Date().toISOString().split('T')[0]),
        };
        setCurrentUser(syncedUser);
        setCurrentUserState(syncedUser);
      }
    } catch {}
  };

  useEffect(() => {
    refreshAppData();

    // Subscribe to real-time online paper updates from Firestore
    const unsubscribePapers = subscribeToOnlinePapers((onlinePapers) => {
      if (onlinePapers && onlinePapers.length > 0) {
        setPapers((prev) => {
          const map = new Map<string, PaperItem>();
          prev.forEach(p => map.set(p.id, p));
          onlinePapers.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
    });

    // Check URL path / query / hash on route change
    const checkRoute = () => {
      const { tab, paperId, category } = getRouteFromUrl();
      setActiveTab(tab);
      if (category) {
        setSelectedCatalogCategory(category);
      }
      if (paperId) {
        const allCurrentPapers = getAllPapers();
        const found = allCurrentPapers.find(p => String(p.id) === String(paperId));
        if (found) {
          setSelectedPaper(found);
        }
      } else {
        setSelectedPaper(null);
      }
    };

    // Initial check for direct paper link
    const initial = getRouteFromUrl();
    if (initial.paperId) {
      const allCurrentPapers = getAllPapers();
      const found = allCurrentPapers.find(p => String(p.id) === String(initial.paperId));
      if (found) {
        setSelectedPaper(found);
      }
    }

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      unsubscribePapers();
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Update browser URL hash/pathname cleanly when navigating
  const navigateToTab = (tab: string, paperId?: string | null, category?: string | null) => {
    setActiveTab(tab);
    if (category !== undefined) {
      setSelectedCatalogCategory(category);
    }
    const targetUrl = getUrlForTab(tab, paperId, category);
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPaper = (paper: PaperItem) => {
    setSelectedPaper(paper);
    if (typeof window !== 'undefined') {
      const targetUrl = `/papers?id=${encodeURIComponent(paper.id)}`;
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    }
  };

  const handleClosePaper = () => {
    setSelectedPaper(null);
    if (typeof window !== 'undefined') {
      const targetUrl = getUrlForTab(activeTab, null, selectedCatalogCategory);
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    navigateToTab('home');
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUserState(user);
    
    // NEW: Sync user profile to database immediately after login
    try {
      await profileApi.sync({
        name: user.name,
        email: user.email,
        city: user.city || user.place,
        profession: user.institution || user.course,
        address: '',
        age: null,
        phone_number: user.mobile,
      });
    } catch (err) {
      console.warn('Profile sync failed but login succeeded:', err);
    }
    
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
    setCurrentUser(user);
    setCurrentUserState(user);
    setUsers(getAllUsers());
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
              onSelectPaper={p => handleOpenPaper(p)}
              onViewAllPapers={handleCatalogExplore}
            />

            {/* Free E-Books Highlight */}
            <EBooksSection ebooks={ebooks} />

            {/* Answer Keys Section */}
            <AnswerKeysSection
              answerKeys={answerKeys}
              allPapers={papers}
              onSelectPaper={p => handleOpenPaper(p)}
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
            onSelectPaper={p => handleOpenPaper(p)}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {/* Tab 3: Study Notes & Fast Revision */}
        {activeTab === 'notes' && (
          <NotesSection
            notes={notes}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {/* Tab 4: Free E-Books */}
        {activeTab === 'ebooks' && (
          <EBooksSection ebooks={ebooks} />
        )}

        {/* Tab 5: Answer Keys */}
        {activeTab === 'answer-keys' && (
          <AnswerKeysSection
            answerKeys={answerKeys}
            allPapers={papers}
            onSelectPaper={p => handleOpenPaper(p)}
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
            onSelectPaper={p => handleOpenPaper(p)}
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
            onSelectPaper={p => handleOpenPaper(p)}
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
        onSelectPaper={p => handleOpenPaper(p)}
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
        onProfileUpdated={handleProfileComplete}
        onComplete={handleProfileComplete}
      />

      <PaperViewerModal
        paper={selectedPaper}
        onClose={handleClosePaper}
        onOpenReport={p => setReportingPaper(p)}
        onSelectRelatedPaper={p => handleOpenPaper(p)}
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
