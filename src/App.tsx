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
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

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

  // Sync state from storage
  const refreshAppData = () => {
    initStorage();
    setPapers(getAllPapers());
    setEbooks(getAllEBooks());
    setAnswerKeys(getAllAnswerKeys());
    setUsers(getAllUsers());
    setPayments(getAllPayments());
    setReports(getAllReports());
    setAuditLogs(getAuditLogs());
    setCurrentUserState(getCurrentUser());
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

      {/* Floating WhatsApp Support Helpdesk */}
      <WhatsAppFloatingButton />
    </div>
  );
}
