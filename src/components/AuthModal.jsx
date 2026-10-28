import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Check, Smartphone, RefreshCw, Edit2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  const phoneInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Auto-focus management
  useEffect(() => {
    if (!isOpen) return;
    if (step === 'phone') {
      setTimeout(() => phoneInputRef.current?.focus(), 150);
    } else if (step === 'otp') {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [isOpen, step]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timerId = null;
    if (step === 'otp' && resendTimer > 0) {
      timerId = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [step, resendTimer]);

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

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setOtpDigits(['', '', '', '']);
    setDevOtp('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    setResendTimer(30);
    onClose();
  };

  const handlePhoneChange = (e) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericOnly);
    if (error) setError('');
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await sendOtp({ phone_number: phone });
      if (res.status === 'success') {
        const receivedOtp = String(res.dev_otp || '');
        setDevOtp(receivedOtp);
        setStep('otp');
        setOtpDigits(['', '', '', '']);
        setResendTimer(30);
        setSuccess(res.message || 'OTP sent successfully!');
      } else {
        setError(res.message || 'Unable to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network connection error. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP 4-box handlers
  const handleOtpBoxChange = (index, e) => {
    const rawVal = e.target.value;
    const cleanDigit = rawVal.replace(/\D/g, '').slice(-1);

    const updated = [...otpDigits];
    updated[index] = cleanDigit;
    setOtpDigits(updated);
    if (error) setError('');

    // If entered a digit, advance to next box
    if (cleanDigit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move to previous box and clear it
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/\D/g, '').slice(0, 4).split('');

    if (digits.length > 0) {
      const updated = ['', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 4) updated[i] = d;
      });
      setOtpDigits(updated);
      if (error) setError('');

      const nextFocusIndex = Math.min(digits.length, 3);
      otpInputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleAutoFillDevOtp = () => {
    if (devOtp && devOtp.length >= 4) {
      const digits = devOtp.slice(0, 4).split('');
      setOtpDigits(digits);
      setError('');
      otpInputRefs.current[3]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter the complete 4-digit OTP code.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await verifyOtp({
        phone_number: phone,
        otp: fullOtp,
      });

      if (res.status === 'success') {
        setSuccess(res.message || 'Verified successfully!');
        if (onLoginSuccess && res.user) {
          onLoginSuccess(res.user);
        }
        setTimeout(() => {
          handleClose();
        }, 800);
      } else {
        setError(res.message || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (err) {
      setError('Network error during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedPhone = phone.length === 10
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : `+91 ${phone}`;

  const isOtpComplete = otpDigits.every((d) => d !== '');

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
          aria-label="Close login dialog"
          type="button"
        >
          <X size={20} />
        </button>

        {/* 2-Section Grid */}
        <div className="ehaat-auth-layout">
          
          {/* LEFT SECTION: Prominent Logo, Headline & Botanical Highlights */}
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
                Login now to explore E-Haat!
              </h2>

              <p className="ehaat-auth-subtitle">
                Access nursery-fresh plants, campus garden harvests, and tailored plant care consultations.
              </p>

              <div className="ehaat-auth-perks">
                <div className="ehaat-perk-item">
                  <div className="ehaat-perk-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>100% password-free fast login via SMS / WhatsApp</span>
                </div>
                <div className="ehaat-perk-item">
                  <div className="ehaat-perk-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Track live orders & nursery restock alerts</span>
                </div>
                <div className="ehaat-perk-item">
                  <div className="ehaat-perk-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Exclusive campus nursery member discounts</span>
                </div>
              </div>

              <div className="ehaat-auth-footer-badge">
                <ShieldCheck size={16} />
                <span>Official ITMU E-Haat Agri-Nursery Portal</span>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Screen 1 (Phone Input) or Screen 2 (OTP Verification) */}
          <div className="ehaat-auth-right">
            
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

            {/* SCREEN 1: Mobile Number Input */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="ehaat-auth-form">
                <div className="ehaat-form-header">
                  <h3 className="ehaat-screen-title">Login / Sign Up</h3>
                  <p className="ehaat-screen-desc">
                    Enter your mobile number to receive a one-time verification code.
                  </p>
                </div>

                <div className="ehaat-field-group">
                  <label htmlFor="ehaat-mobile-input" className="ehaat-field-label">
                    <Smartphone size={15} />
                    <span>Mobile Number</span>
                  </label>
                  
                  <div className="ehaat-phone-input-row">
                    <div className="ehaat-country-code" title="India (+91)">
                      <span className="ehaat-flag" aria-hidden="true">🇮🇳</span>
                      <span className="ehaat-dial">+91</span>
                    </div>
                    <input
                      ref={phoneInputRef}
                      id="ehaat-mobile-input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="ehaat-phone-input"
                      maxLength={10}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                {/* Full-width Submit button */}
                <button
                  type="submit"
                  className="ehaat-primary-btn"
                  disabled={isLoading || phone.length !== 10}
                  id="ehaat-submit-phone-btn"
                >
                  {isLoading ? (
                    <span className="ehaat-btn-spinner" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="ehaat-terms-text">
                  By continuing, you agree to ITMU E-Haat's{' '}
                  <span className="ehaat-legal-link">Terms of Service</span> and{' '}
                  <span className="ehaat-legal-link">Privacy Policy</span>.
                </p>
              </form>
            )}

            {/* SCREEN 2: 4-Box OTP Verification Screen */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="ehaat-auth-form">
                <div className="ehaat-form-header">
                  <h3 className="ehaat-screen-title">OTP Verification</h3>
                  <div className="ehaat-otp-target-row">
                    <span className="ehaat-target-text">
                      OTP sent to <strong>{formattedPhone}</strong>
                    </span>
                    <button
                      type="button"
                      className="ehaat-edit-phone-btn"
                      onClick={() => {
                        setStep('phone');
                        setError('');
                        setSuccess('');
                      }}
                      title="Edit mobile number"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Dev Helper Card (Provides immediate testing feedback for demo environments) */}
                {devOtp && (
                  <div className="ehaat-dev-otp-card">
                    <div className="ehaat-dev-otp-text">
                      <span className="ehaat-dev-badge">Test OTP:</span>
                      <span className="ehaat-dev-code">{devOtp}</span>
                    </div>
                    <button
                      type="button"
                      className="ehaat-dev-paste-btn"
                      onClick={handleAutoFillDevOtp}
                      title="Quick auto-fill test OTP"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                {/* 4 Separate OTP Input Boxes */}
                <div className="ehaat-otp-boxes-wrapper">
                  <label className="ehaat-field-label" htmlFor="otp-box-0">
                    Enter 4-Digit Verification Code
                  </label>
                  <div className="ehaat-otp-boxes" onPaste={handleOtpPaste}>
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-box-${index}`}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpDigits[index]}
                        onChange={(e) => handleOtpBoxChange(index, e)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`ehaat-otp-box ${otpDigits[index] ? 'filled' : ''}`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP Row */}
                <div className="ehaat-resend-row">
                  {resendTimer > 0 ? (
                    <span className="ehaat-resend-timer">
                      Resend OTP in <strong>{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="ehaat-resend-btn"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      <RefreshCw size={13} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                {/* Full-width Verify button */}
                <button
                  type="submit"
                  className="ehaat-primary-btn"
                  disabled={isLoading || !isOtpComplete}
                  id="ehaat-verify-otp-btn"
                >
                  {isLoading ? (
                    <span className="ehaat-btn-spinner" />
                  ) : (
                    <>
                      <span>Verify &amp; Proceed</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
