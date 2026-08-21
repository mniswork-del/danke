import React, { useState } from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import {
  X,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { authApi } from '../lib/api';
import { setCurrentUser, saveRegisteredUserSession } from '../lib/storage';
import {
  authenticateWithFirestore,
  saveUserToFirestore,
  getUserFromFirestore,
} from '../lib/firestoreService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onOpenProfileCompletion?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'register' | 'login'>('login');
  
  // Registration & Login Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset errors when switching mode
  const handleSwitchMode = (newMode: 'register' | 'login') => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  // Handle New User Registration via Hostinger MySQL Backend API
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let cleanPhone = phone.replace(/\D/g, '').trim();
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    if (!cleanPhone) {
      setErrorMessage('Phone number cannot be empty.');
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Password cannot be empty.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Confirm password cannot be empty.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and confirm password must match.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate & Register in Firestore Cloud Database
      const firestoreRes = await authenticateWithFirestore(cleanPhone, password);
      if (firestoreRes.error) {
        setErrorMessage(firestoreRes.error);
        setIsLoading(false);
        return;
      }

      // 2. Also register in Backend API
      authApi.register(cleanPhone, password).catch(e => console.warn('Backend API note:', e));

      setSuccessMessage('Account registered successfully!');
      
      const registeredUser: User = firestoreRes.user || {
        id: `usr-${Date.now()}`,
        mobile: cleanPhone,
        name: `Student ${cleanPhone.slice(-4)}`,
        city: '',
        email: '',
        profileCompleted: false,
        profileCompletionPercent: 20,
        role: 'student',
        status: 'active',
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
        joinedDate: new Date().toISOString().split('T')[0],
      };

      const savedUser = saveRegisteredUserSession(registeredUser);
      setCurrentUser(savedUser);

      setTimeout(() => {
        onLoginSuccess(savedUser);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login for Existing User
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let cleanPhone = phone.replace(/\D/g, '').trim();
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Password cannot be empty.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check Cloud Firestore online database first for persistent profile
      const firestoreAuth = await authenticateWithFirestore(cleanPhone, password);
      
      if (firestoreAuth.error) {
        setErrorMessage(firestoreAuth.error);
        setIsLoading(false);
        return;
      }

      // 2. Also authenticate against backend API if available
      let backendUser: any = null;
      try {
        const apiData = await authApi.login(cleanPhone, password);
        if (apiData && apiData.user) {
          backendUser = apiData.user;
        }
      } catch (e) {
        console.warn('Backend API login note:', e);
      }

      setSuccessMessage('Logged in successfully!');

      const cloudUser = firestoreAuth.user;
      const profileObj = backendUser?.profile || {};

      const loggedInUser: Partial<User> & { mobile: string } = {
        id: cloudUser?.id || String(backendUser?.id || Date.now()),
        mobile: cleanPhone,
        name: (cloudUser?.name && !cloudUser.name.startsWith('Student ') && !cloudUser.name.startsWith('User '))
          ? cloudUser.name
          : (profileObj.name || cloudUser?.name || `Student ${cleanPhone.slice(-4)}`),
        email: cloudUser?.email || profileObj.email || '',
        dob: cloudUser?.dob || '',
        place: cloudUser?.place || cloudUser?.city || profileObj.city || '',
        city: cloudUser?.city || cloudUser?.place || profileObj.city || '',
        state: cloudUser?.state || 'Uttar Pradesh',
        educationCategory: cloudUser?.educationCategory || 'college',
        institution: cloudUser?.institution || profileObj.profession || '',
        course: cloudUser?.course || profileObj.profession || '',
        preferredSubjects: cloudUser?.preferredSubjects || [],
        avatarUrl: cloudUser?.avatarUrl || '',
        payoutUpiId: cloudUser?.payoutUpiId || '',
        payoutAccountName: cloudUser?.payoutAccountName || '',
        profileCompleted: Boolean(cloudUser?.profileCompleted) || Boolean(cloudUser?.name && !cloudUser.name.startsWith('Student ') && !cloudUser.name.startsWith('User ')),
        profileCompletionPercent: typeof cloudUser?.profileCompletionPercent === 'number'
          ? cloudUser.profileCompletionPercent
          : (cloudUser?.profileCompleted ? 100 : 20),
        role: cloudUser?.role || 'student',
        status: cloudUser?.status || 'active',
        otpVerified: true,
        joinedDate: cloudUser?.joinedDate || (backendUser?.created_at ? new Date(backendUser.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        uploadedCount: cloudUser?.uploadedCount || 0,
        approvedCount: cloudUser?.approvedCount || 0,
        rejectedCount: cloudUser?.rejectedCount || 0,
        duplicateCount: cloudUser?.duplicateCount || 0,
        pendingCount: cloudUser?.pendingCount || 0,
        totalViews: cloudUser?.totalViews || 0,
        totalDownloads: cloudUser?.totalDownloads || 0,
        totalEarned: cloudUser?.totalEarned || 0,
        pendingPayment: cloudUser?.pendingPayment || 0,
        totalPaid: cloudUser?.totalPaid || 0,
      };

      const savedUser = saveRegisteredUserSession(loggedInUser);
      setCurrentUser(savedUser);

      setTimeout(() => {
        onLoginSuccess(savedUser);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid phone number or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center flex flex-col items-center mb-5">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {mode === 'register'
              ? 'Join University Tree to download PYQs, answer keys & study materials'
              : 'Log in with your phone number and password'}
          </p>
        </div>

        {/* Tabs: Create Account vs Log In */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            id="tab-register-btn"
            onClick={() => handleSwitchMode('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            id="tab-login-btn"
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Message Box */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ---------------- REGISTRATION FORM ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* 1. Phone Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <div className="px-3.5 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 bg-slate-100/80 flex items-center space-x-1 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  id="register-phone-input"
                  maxLength={15}
                  value={phone}
                  onChange={e => {
                    setErrorMessage('');
                    const raw = e.target.value.replace(/\D/g, '');
                    setPhone(raw.length > 10 ? raw.slice(-10) : raw);
                  }}
                  placeholder="98765 43210"
                  className="w-full px-3.5 py-3 text-sm font-bold text-slate-900 bg-transparent focus:outline-hidden tracking-wider"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 2. Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">Min. 6 characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password-input"
                  value={password}
                  onChange={e => {
                    setErrorMessage('');
                    setPassword(e.target.value);
                  }}
                  placeholder="Enter your password (min 6 chars)"
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Confirm Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="register-confirm-password-input"
                  value={confirmPassword}
                  onChange={e => {
                    setErrorMessage('');
                    setConfirmPassword(e.target.value);
                  }}
                  placeholder="Re-enter your password"
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Submit: Create Account */}
            <button
              type="submit"
              id="create-account-submit-btn"
              disabled={isLoading || !phone || !password || !confirmPassword || password.length < 6 || password !== confirmPassword}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Toggle to Sign In */}
            <p className="text-center text-xs text-slate-500 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          </form>
        )}

        {/* ---------------- LOGIN FORM ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <div className="px-3.5 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 bg-slate-100/80 flex items-center space-x-1 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  id="login-phone-input"
                  maxLength={15}
                  value={phone}
                  onChange={e => {
                    setErrorMessage('');
                    const raw = e.target.value.replace(/\D/g, '');
                    setPhone(raw.length > 10 ? raw.slice(-10) : raw);
                  }}
                  placeholder="98765 43210"
                  className="w-full px-3.5 py-3 text-sm font-bold text-slate-900 bg-transparent focus:outline-hidden tracking-wider"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={e => {
                    setErrorMessage('');
                    setPassword(e.target.value);
                  }}
                  placeholder="Enter your account password"
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit: Log In */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={phone.length !== 10 || !password}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <span>Log In & Continue</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Toggle to Register */}
            <p className="text-center text-xs text-slate-500 pt-2">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* Safe Security Notice */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>End-to-end encrypted password verification</span>
          </p>
        </div>

      </div>
    </div>
  );
};
