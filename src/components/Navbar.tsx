import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import {
  Upload,
  Menu,
  X,
  Wallet,
  ShieldAlert,
  GraduationCap,
  LogOut,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { calculateProfileCompletion } from '../lib/storage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenUserDashboard: () => void;
  onOpenProfileCompletion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenUpload,
  onLogout,
  onOpenAdmin,
  onOpenUserDashboard,
  onOpenProfileCompletion,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const profileStats = calculateProfileCompletion(currentUser);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Auto Hide on Scroll Down, Show on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at the top of the page
      if (currentScrollY <= 25) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // If scrolling down by more than 8px, hide header
      if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false);
        setUserDropdownOpen(false);
      }
      // If scrolling up by more than 8px, reveal header
      else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct 4 main menus + Guide & Support
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'papers', label: 'Question Papers' },
    { id: 'ebooks', label: 'E-Books' },
    { id: 'answer-keys', label: 'Answer Keys' },
    { id: 'support', label: 'Guide & Support' },
  ];

  return (
    <header
      className={`sticky top-2 sm:top-5 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300 ease-in-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-32 sm:-translate-y-36 opacity-0 pointer-events-none'
      }`}
    >
      {/* Floating Pill Capsule Header Matching Photo */}
      <div className="bg-white rounded-3xl sm:rounded-full border border-slate-200/90 shadow-xl shadow-slate-900/10 px-5 sm:px-8 lg:px-10 py-3 sm:py-4 flex items-center justify-between min-h-[80px] sm:min-h-[92px] backdrop-blur-md">
        
        {/* Left: Brand Official Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center text-left focus:outline-hidden cursor-pointer shrink-0 py-1"
          title="University Tree"
        >
          <Logo size="md" />
        </button>

        {/* Center: Direct Menu Items (Home, Question Papers, E-Books, Answer Keys, Guide & Support) */}
        <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm xl:text-base font-bold transition-colors cursor-pointer py-1.5 px-0.5 relative ${
                  isActive
                    ? 'text-orange-600 font-extrabold'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Upload Pill Button & ONLY Human Account Icon */}
        <div className="hidden sm:flex items-center space-x-3.5 xl:space-x-4">
          {/* Upload Pill Button */}
          <button
            onClick={onOpenUpload}
            className="px-5 xl:px-7 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-98 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span className="whitespace-nowrap">Upload Paper</span>
          </button>

          {/* ONLY Human Account Icon */}
          <div className="relative" ref={userDropdownRef}>
            {currentUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                id="user-profile-menu-btn"
                className="h-11 px-2.5 rounded-full border-2 border-emerald-500/40 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 transition-all flex items-center space-x-2 cursor-pointer shadow-2xs relative group"
                title={`Account: ${currentUser.name} (${profileStats.percent}% Complete)`}
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Percentage Badge */}
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    profileStats.percent >= 100
                      ? 'bg-emerald-100 text-emerald-800'
                      : profileStats.percent >= 50
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {profileStats.percent >= 100 ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : null}
                  <span>{profileStats.percent}%</span>
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                id="login-header-btn"
                className="w-11 h-11 rounded-full border border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer shadow-2xs group"
                title="Student Account / Login"
                aria-label="Student Account / Login"
              >
                <UserIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            )}

            {/* User Dropdown when logged in */}
            {currentUser && userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/5">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-3xl">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">+91 {currentUser.mobile}</p>
                    </div>
                  </div>

                  {/* Profile Completion Callout Box */}
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                      <span>Profile Completion:</span>
                      <span className="font-extrabold text-emerald-700">{profileStats.percent}%</span>
                    </div>
                    
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{ width: `${profileStats.percent}%` }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenProfileCompletion) onOpenProfileCompletion();
                      }}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{profileStats.percent === 100 ? 'View / Edit Profile' : 'Complete Profile Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="py-1.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenUserDashboard();
                    }}
                    className="w-full text-left px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenUserDashboard();
                    }}
                    className="w-full text-left px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>My Contributions</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-5 py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center space-x-2.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Admin Portal</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header Right Controls: Only Human Account Icon + Mobile Menu Hamburger */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          {/* Mobile Human Account Icon with Badge */}
          {currentUser ? (
            <button
              onClick={() => {
                if (profileStats.percent < 100 && onOpenProfileCompletion) {
                  onOpenProfileCompletion();
                } else {
                  onOpenUserDashboard();
                }
              }}
              className="px-2.5 py-1.5 rounded-full border border-emerald-500/40 bg-white text-emerald-800 flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title={`My Account (${profileStats.percent}% Complete)`}
              aria-label="My Account"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  profileStats.percent >= 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {profileStats.percent}%
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center cursor-pointer shadow-2xs"
              title="Student Account / Login"
              aria-label="Student Account / Login"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}

          {/* Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-full text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  activeTab === item.id
                    ? 'text-orange-600 bg-orange-50 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Action Area */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenUpload();
              }}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Paper</span>
            </button>

            {currentUser ? (
              <div className="space-y-2 pt-1">
                {/* Profile progress box */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">Profile Completion:</span>
                    <span className="text-emerald-700 font-extrabold">{profileStats.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${profileStats.percent}%` }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenProfileCompletion) onOpenProfileCompletion();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{profileStats.percent === 100 ? 'View Complete Profile' : 'Complete Profile (Name, DOB, Place)'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUserDashboard();
                  }}
                  className="w-full py-2.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>My Dashboard ({currentUser.name})</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 rounded-full text-rose-600 bg-rose-50 text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Student Account (Login / Register)</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2.5 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Admin Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
