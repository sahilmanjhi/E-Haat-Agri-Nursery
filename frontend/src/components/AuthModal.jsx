import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight, 
  Check, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { loginUser, registerUser, forgotPassword, resetPassword } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  // Modes: 'signin' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('signin');

  // Form states
  const [identifier, setIdentifier] = useState(''); // Email or Username for login
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Forgot password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [devResetCode, setDevResetCode] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [socialInfo, setSocialInfo] = useState('');

  // Refs for auto-focus
  const identifierInputRef = useRef(null);
  const firstNameInputRef = useRef(null);
  const resetEmailInputRef = useRef(null);

  const handleClose = () => {
    setMode('signin');
    setIdentifier('');
    setLoginPassword('');
    setShowLoginPassword(false);
    setFirstName('');
    setRegisterPhone('');
    setRegisterEmail('');
    setRegisterPassword('');
    setShowRegisterPassword(false);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setDevResetCode('');
    setError('');
    setSuccess('');
    setSocialInfo('');
    setIsLoading(false);
    onClose();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setSocialInfo('');
  };

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'signin') {
      setTimeout(() => identifierInputRef.current?.focus(), 150);
    } else if (mode === 'register') {
      setTimeout(() => firstNameInputRef.current?.focus(), 150);
    } else if (mode === 'forgot') {
      setTimeout(() => resetEmailInputRef.current?.focus(), 150);
    }
  }, [isOpen, mode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);


  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  // 1. SIGN IN (Email/Username + Password)
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your username or email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await loginUser({
        identifier: identifier.trim(),
        password: loginPassword,
      });

      if (res.status === 'success' && res.user) {
        setSuccess(res.message || 'Logged in successfully!');
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
        setTimeout(() => handleClose(), 700);
      } else {
        setError(res.message || 'Invalid username/email or password. Please try again.');
      }
    } catch {
      setError('Network connection error. Please verify the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CREATE ACCOUNT (First Name, Phone Number, Email, Password)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!registerEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail.trim())) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await registerUser({
        first_name: firstName.trim(),
        phone_number: registerPhone.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      if (res.status === 'success' && res.user) {
        setSuccess(res.message || 'Account created successfully!');
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
        setTimeout(() => handleClose(), 800);
      } else {
        setError(res.message || 'Unable to create account. Please check the information.');
      }
    } catch {
      setError('Network error during registration. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FORGOT PASSWORD (Send reset code to email)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await forgotPassword({ email: resetEmail.trim() });
      if (res.status === 'success') {
        setSuccess(res.message || 'Verification code sent to your email.');
        if (res.dev_code) {
          setDevResetCode(String(res.dev_code));
          setResetCode(String(res.dev_code));
        }
        setMode('reset');
      } else {
        setError(res.message || 'Could not find an account with that email address.');
      }
    } catch {
      setError('Network error while requesting reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. RESET PASSWORD (Verify code and set new password)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await resetPassword({
        email: resetEmail.trim(),
        code: resetCode.trim(),
        new_password: newPassword,
      });

      if (res.status === 'success') {
        setSuccess(res.message || 'Password reset successfully! You are now logged in.');
        if (onLoginSuccess && res.user) {
          onLoginSuccess(res.user);
        }
        setTimeout(() => handleClose(), 1000);
      } else {
        setError(res.message || 'Invalid or expired verification code.');
      }
    } catch {
      setError('Network error while resetting password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login handler (Google / Facebook)
  const handleSocialClick = (provider) => {
    setSocialInfo(
      `${provider} Sign-In connects via OAuth. Please use your Email and Password below for standard access.`
    );
    setTimeout(() => setSocialInfo(''), 6000);
  };

  if (!isOpen) return null;

  return (


    <div className="ehaat-modal-overlay" onClick={handleClose}>
      <div 
        className="ehaat-auth-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ehaat-auth-title"
      >
        {/* Top-Right Close Button */}
        <button 
          className="ehaat-modal-close" 
          onClick={handleClose}
          aria-label="Close dialog"
          type="button"
        >
          <X size={20} />
        </button>

        {/* 2-Column Responsive Layout */}
        <div className="ehaat-auth-layout">
          
          {/* LEFT SECTION: Botanical Brand Presentation */}
          <div className="ehaat-auth-left">
            <div className="ehaat-auth-left-inner">
              <div className="ehaat-auth-brand">
                <img 
                  src="/images/itmu_ehaat_logo.png" 
                  alt="ITMU E-Haat"
                  className="ehaat-auth-logo"
                />
              </div>

              <h2 id="ehaat-auth-title" className="ehaat-auth-headline">
                {mode === 'register' ? 'Join Our Green Community!' : 'Welcome to ITMU E-Haat!'}
              </h2>

              <p className="ehaat-auth-subtitle">
                Access nursery-fresh plants, organic fertilizers, campus harvests, and tailored plant care consultations.
              </p>

              <div className="ehaat-auth-perks">
                <div className="ehaat-perk-item">
                  <div className="ehaat-perk-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Secure Email &amp; Password authentication</span>
                </div>
                <div className="ehaat-perk-item">
                  <div className="ehaat-perk-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Track live orders &amp; nursery harvest restocks</span>
                </div>
                <div className="ehaat-perk-item">
                  <div className="ehaat-perk-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Exclusive member discounts &amp; potting guides</span>
                </div>
              </div>

              <div className="ehaat-auth-footer-badge">
                <ShieldCheck size={16} />
                <span>Official ITMU E-Haat Agri-Nursery Portal</span>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Interactive Forms */}
          <div className="ehaat-auth-right">

            {/* Navigation Tabs (Sign In / Create Account) */}
            {(mode === 'signin' || mode === 'register') && (
              <div className="ehaat-auth-tabs">
                <button
                  type="button"
                  className={`ehaat-auth-tab ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => switchMode('signin')}
                  id="tab-sign-in"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`ehaat-auth-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => switchMode('register')}
                  id="tab-create-account"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Breadcrumb / Back button when in Forgot / Reset Mode */}
            {(mode === 'forgot' || mode === 'reset') && (
              <div className="ehaat-back-row">
                <button
                  type="button"
                  className="ehaat-back-link"
                  onClick={() => switchMode('signin')}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            )}
            
            {/* Feedback Alerts */}
            {error && (
              <div className="ehaat-alert ehaat-alert-error" role="alert">
                <AlertCircle size={18} className="ehaat-alert-icon" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="ehaat-alert ehaat-alert-success" role="status">
                <Check size={18} className="ehaat-alert-icon" />
                <span>{success}</span>
              </div>
            )}
            {socialInfo && (
              <div className="ehaat-alert ehaat-alert-info" role="status">
                <Sparkles size={18} className="ehaat-alert-icon" />
                <span>{socialInfo}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 1: SIGN IN PAGE */}
            {/* ========================================================= */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="ehaat-auth-form" noValidate>
                <div className="ehaat-form-header">
                  <h3 className="ehaat-screen-title">Sign In</h3>
                  <p className="ehaat-screen-desc">
                    Enter your email or username to access your nursery account.
                  </p>
                </div>

                {/* Username or Email field */}
                <div className="ehaat-field-group">
                  <label htmlFor="signin-identifier" className="ehaat-field-label">
                    <Mail size={15} />
                    <span>Username or Email</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      ref={identifierInputRef}
                      id="signin-identifier"
                      type="text"
                      placeholder="name@example.com or username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password field with Forgot Password link */}
                <div className="ehaat-field-group">
                  <div className="ehaat-label-row">
                    <label htmlFor="signin-password" className="ehaat-field-label">
                      <Lock size={15} />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      className="ehaat-forgot-link"
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="ehaat-input-box">
                    <input
                      id="signin-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="ehaat-eye-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="ehaat-primary-btn"
                  disabled={isLoading || !identifier.trim() || !loginPassword}
                  id="btn-sign-in"
                >
                  {isLoading ? (
                    <span className="ehaat-btn-spinner" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {/* Social Login Options */}
                <div className="ehaat-social-divider">
                  <span>or continue with</span>
                </div>

                <div className="ehaat-social-row">
                  <button
                    type="button"
                    className="ehaat-social-btn ehaat-google-btn"
                    onClick={() => handleSocialClick('Google')}
                  >
                    <svg className="ehaat-social-svg" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="ehaat-social-btn ehaat-facebook-btn"
                    onClick={() => handleSocialClick('Facebook')}
                  >
                    <svg className="ehaat-social-svg" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Footer Switcher */}
                <p className="ehaat-auth-switch-text">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="ehaat-switch-link"
                    onClick={() => switchMode('register')}
                  >
                    Create Account
                  </button>
                </p>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: CREATE ACCOUNT PAGE */}
            {/* ========================================================= */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="ehaat-auth-form" noValidate>
                <div className="ehaat-form-header">
                  <h3 className="ehaat-screen-title">Create Account</h3>
                  <p className="ehaat-screen-desc">
                    Enter your details to register as an ITMU E-Haat member.
                  </p>
                </div>

                {/* First Name */}
                <div className="ehaat-field-group">
                  <label htmlFor="register-firstname" className="ehaat-field-label">
                    <User size={15} />
                    <span>First Name</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      ref={firstNameInputRef}
                      id="register-firstname"
                      type="text"
                      placeholder="e.g. Sahil"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="ehaat-field-group">
                  <label htmlFor="register-phone" className="ehaat-field-label">
                    <Phone size={15} />
                    <span>Phone Number</span>
                  </label>
                  <div className="ehaat-phone-input-row">
                    <div className="ehaat-country-code" title="India (+91)">
                      <span className="ehaat-flag" aria-hidden="true">🇮🇳</span>
                      <span className="ehaat-dial">+91</span>
                    </div>
                    <input
                      id="register-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={registerPhone}
                      onChange={(e) => {
                        setRegisterPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (error) setError('');
                      }}
                      className="ehaat-phone-input"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="ehaat-field-group">
                  <label htmlFor="register-email" className="ehaat-field-label">
                    <Mail size={15} />
                    <span>Email Address</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      id="register-email"
                      type="email"
                      placeholder="name@example.com"
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="ehaat-field-group">
                  <label htmlFor="register-password" className="ehaat-field-label">
                    <Lock size={15} />
                    <span>Password</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="ehaat-eye-btn"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  className="ehaat-primary-btn"
                  disabled={isLoading || !firstName.trim() || !registerEmail.trim() || !registerPassword}
                  id="btn-create-account"
                >
                  {isLoading ? (
                    <span className="ehaat-btn-spinner" />
                  ) : (
                    <>
                      <span>Create New Account</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {/* Social Login Options */}
                <div className="ehaat-social-divider">
                  <span>or register with</span>
                </div>

                <div className="ehaat-social-row">
                  <button
                    type="button"
                    className="ehaat-social-btn ehaat-google-btn"
                    onClick={() => handleSocialClick('Google')}
                  >
                    <svg className="ehaat-social-svg" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="ehaat-social-btn ehaat-facebook-btn"
                    onClick={() => handleSocialClick('Facebook')}
                  >
                    <svg className="ehaat-social-svg" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Footer Switcher */}
                <p className="ehaat-auth-switch-text">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="ehaat-switch-link"
                    onClick={() => switchMode('signin')}
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: FORGOT PASSWORD (STEP 1: REQUEST CODE) */}
            {/* ========================================================= */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="ehaat-auth-form" noValidate>
                <div className="ehaat-form-header">
                  <div className="ehaat-icon-badge">
                    <KeyRound size={22} />
                  </div>
                  <h3 className="ehaat-screen-title">Reset Your Password</h3>
                  <p className="ehaat-screen-desc">
                    Enter your registered email address and we'll send you a 6-digit verification code.
                  </p>
                </div>

                <div className="ehaat-field-group">
                  <label htmlFor="forgot-email" className="ehaat-field-label">
                    <Mail size={15} />
                    <span>Email Address</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      ref={resetEmailInputRef}
                      id="forgot-email"
                      type="email"
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="ehaat-primary-btn"
                  disabled={isLoading || !resetEmail.trim()}
                  id="btn-send-reset-code"
                >
                  {isLoading ? (
                    <span className="ehaat-btn-spinner" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="ehaat-auth-switch-text">
                  Remember your password?{' '}
                  <button
                    type="button"
                    className="ehaat-switch-link"
                    onClick={() => switchMode('signin')}
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 4: RESET PASSWORD (STEP 2: VERIFY & SET NEW PASSWORD) */}
            {/* ========================================================= */}
            {mode === 'reset' && (
              <form onSubmit={handleResetPassword} className="ehaat-auth-form" noValidate>
                <div className="ehaat-form-header">
                  <h3 className="ehaat-screen-title">Enter New Password</h3>
                  <p className="ehaat-screen-desc">
                    Verification code sent to <strong>{resetEmail}</strong>
                  </p>
                </div>

                {/* Dev Helper Card when devResetCode is provided */}
                {devResetCode && (
                  <div className="ehaat-dev-otp-card">
                    <div className="ehaat-dev-otp-text">
                      <span className="ehaat-dev-badge">Reset Code:</span>
                      <span className="ehaat-dev-code">{devResetCode}</span>
                    </div>
                    <button
                      type="button"
                      className="ehaat-dev-paste-btn"
                      onClick={() => setResetCode(devResetCode)}
                    >
                      Use Code
                    </button>
                  </div>
                )}

                {/* Verification code */}
                <div className="ehaat-field-group">
                  <label htmlFor="reset-code" className="ehaat-field-label">
                    <KeyRound size={15} />
                    <span>6-Digit Verification Code</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      id="reset-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 123456"
                      value={resetCode}
                      onChange={(e) => {
                        setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="ehaat-field-group">
                  <label htmlFor="new-password" className="ehaat-field-label">
                    <Lock size={15} />
                    <span>New Password</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      required
                    />
                    <button
                      type="button"
                      className="ehaat-eye-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="ehaat-field-group">
                  <label htmlFor="confirm-password" className="ehaat-field-label">
                    <Lock size={15} />
                    <span>Confirm Password</span>
                  </label>
                  <div className="ehaat-input-box">
                    <input
                      id="confirm-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className="ehaat-text-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="ehaat-primary-btn"
                  disabled={isLoading || !resetCode || !newPassword || !confirmPassword}
                  id="btn-update-password"
                >
                  {isLoading ? (
                    <span className="ehaat-btn-spinner" />
                  ) : (
                    <>
                      <span>Update Password &amp; Login</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="ehaat-auth-switch-text">
                  Did not receive code?{' '}
                  <button
                    type="button"
                    className="ehaat-switch-link"
                    onClick={() => switchMode('forgot')}
                  >
                    Resend Code
                  </button>
                </p>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
