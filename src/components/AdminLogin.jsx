import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  KeyRound,
  Sparkles,
  Info
} from 'lucide-react';
import { adminLogin, forgotPassword, resetPassword } from '../services/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal state for admins
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code + new pass
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [devCode, setDevCode] = useState('');

  const emailInputRef = useRef(null);

  useEffect(() => {
    // Focus email input on initial load
    emailInputRef.current?.focus();
    document.title = 'Admin Login | ITMU E-Haat';
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      emailInputRef.current?.focus();
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await adminLogin({ email: cleanEmail, password });

      if (res.status === 'success' && res.user) {
        setSuccessMessage('Admin credentials verified. Redirecting to dashboard...');
        
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(res.user);
          } else {
            window.location.pathname = '/admin/dashboard';
          }
        }, 700);
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Network connection error. Please verify the backend server is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Forgot Password flow
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered administrator email.');
      return;
    }

    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await forgotPassword({ email: forgotEmail.trim() });
      if (res.status === 'success') {
        setForgotSuccess(res.message || 'Reset verification code sent to your email.');
        if (res.dev_code) {
          setDevCode(String(res.dev_code));
          setResetCode(String(res.dev_code));
        }
        setForgotStep(2);
      } else {
        setForgotError(res.message || 'No account matching this email address.');
      }
    } catch {
      setForgotError('Network error while requesting password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await resetPassword({
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        new_password: newPassword
      });

      if (res.status === 'success') {
        setForgotSuccess('Password updated successfully! Please sign in with your new password.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotError('');
          setForgotSuccess('');
          setPassword('');
          setEmail(forgotEmail);
        }, 1200);
      } else {
        setForgotError(res.message || 'Invalid or expired code.');
      }
    } catch {
      setForgotError('Network error while resetting password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="admin-portal-container">
      {/* Background Subtle Botanical Accent Gradients */}
      <div className="admin-bg-leaf-pattern" aria-hidden="true" />

      {/* Navigation header row */}
      <header className="admin-top-nav">
        <a href="/" className="admin-back-store-btn" title="Return to nursery storefront">
          <ArrowLeft size={16} />
          <span>Back to Nursery Store</span>
        </a>

        <div className="admin-status-badge">
          <ShieldCheck size={14} className="admin-badge-icon" />
          <span>Secure Admin Portal</span>
        </div>
      </header>

      {/* Main Login Card Wrapper */}
      <main className="admin-card-wrapper">
        <div className="admin-login-card">
          
          {/* Header Brand Section */}
          <div className="admin-card-header">
            <div className="admin-logo-badge">
              <img 
                src="/images/itmu_ehaat_logo.png" 
                alt="ITMU E-Haat Logo" 
                className="admin-brand-logo"
              />
            </div>

            <div className="admin-brand-tagline">
              <Sparkles size={13} className="admin-sparkle-icon" />
              <span>Freshness at Your Doorstep.</span>
            </div>

            <h1 className="admin-login-heading">Welcome Back, Admin.</h1>
            <p className="admin-login-subtext">
              Sign in to manage plant inventory, verify orders, and oversee nursery operations.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="admin-alert admin-alert-error" role="alert">
              <AlertCircle size={18} className="admin-alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="admin-alert admin-alert-success" role="status">
              <CheckCircle2 size={18} className="admin-alert-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleLoginSubmit} className="admin-login-form" noValidate>
            {/* Email Field */}
            <div className="admin-field-group">
              <label htmlFor="admin-email-input" className="admin-field-label">
                <Mail size={15} />
                <span>Admin Email Address</span>
              </label>
              <div className="admin-input-box">
                <input
                  ref={emailInputRef}
                  id="admin-email-input"
                  type="email"
                  placeholder="admin@itmu-ehaat.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoComplete="username"
                  className="admin-text-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="admin-field-group">
              <div className="admin-label-split">
                <label htmlFor="admin-password-input" className="admin-field-label">
                  <Lock size={15} />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  className="admin-forgot-btn"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="admin-input-box">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your administrator password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoComplete="current-password"
                  className="admin-text-input"
                  required
                />
                <button
                  type="button"
                  className="admin-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Prominent Sign In Button */}
            <button
              type="submit"
              className="admin-submit-btn"
              disabled={isLoading || !email.trim() || !password}
              id="admin-signin-btn"
            >
              {isLoading ? (
                <span className="admin-btn-spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="admin-card-footer">
            <div className="admin-security-pill">
              <ShieldCheck size={14} />
              <span>Authorized administrators only</span>
            </div>
            <p className="admin-security-subnote">
              Unauthorized access attempts to the nursery administrative system are monitored and restricted.
            </p>
          </div>

        </div>
      </main>

      {/* Forgot Password Modal for Admins */}
      {showForgotModal && (
        <div className="admin-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-icon-badge">
                <KeyRound size={20} />
              </div>
              <h3 className="admin-modal-title">Admin Password Reset</h3>
              <p className="admin-modal-desc">
                {forgotStep === 1 
                  ? 'Enter your administrator email to receive a 6-digit verification code.' 
                  : `Verification code sent to ${forgotEmail}. Set your new password below.`}
              </p>
            </div>

            {forgotError && (
              <div className="admin-alert admin-alert-error" role="alert">
                <AlertCircle size={16} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="admin-alert admin-alert-success" role="status">
                <CheckCircle2 size={16} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit}>
                <div className="admin-field-group">
                  <label className="admin-field-label" htmlFor="forgot-email-input">
                    <Mail size={14} />
                    <span>Admin Email</span>
                  </label>
                  <div className="admin-input-box">
                    <input
                      id="forgot-email-input"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@itmu-ehaat.in"
                      className="admin-text-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-submit-btn"
                    disabled={forgotLoading || !forgotEmail.trim()}
                  >
                    {forgotLoading ? <span className="admin-btn-spinner" /> : 'Send Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit}>
                {devCode && (
                  <div className="admin-dev-notice">
                    <span>Dev Verification Code:</span>
                    <strong>{devCode}</strong>
                  </div>
                )}

                <div className="admin-field-group">
                  <label className="admin-field-label" htmlFor="reset-code-input">
                    <span>6-Digit Code</span>
                  </label>
                  <div className="admin-input-box">
                    <input
                      id="reset-code-input"
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="admin-text-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label" htmlFor="new-pass-input">
                    <span>New Password</span>
                  </label>
                  <div className="admin-input-box">
                    <input
                      id="new-pass-input"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="admin-text-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label" htmlFor="confirm-pass-input">
                    <span>Confirm New Password</span>
                  </label>
                  <div className="admin-input-box">
                    <input
                      id="confirm-pass-input"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="admin-text-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => setForgotStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="admin-submit-btn"
                    disabled={forgotLoading || !resetCode || !newPassword || !confirmPassword}
                  >
                    {forgotLoading ? <span className="admin-btn-spinner" /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
