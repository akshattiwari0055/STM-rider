"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import AuthGoogleButton from '@/components/AuthGoogleButton';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.requiresOtp) {
        setOtpStep(true);
        setPendingEmail(data.email || formData.email);
        setMessage(data.message || 'We sent a verification code to your email.');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail || formData.email,
          code: otp,
          purpose: 'register',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'OTP verification failed.');
        setOtpLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail || formData.email,
          purpose: 'register',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not resend OTP.');
      } else {
        setMessage(data.message || 'A new OTP has been sent.');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setOtpLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in did not return a valid credential.');
      return;
    }

    setGoogleLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google sign-in failed.');
        setGoogleLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-24 pb-12 sm:pb-12 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#FFB300]/8 rounded-full blur-[100px] z-0 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFB300] to-[#FF6A00] mb-4 shadow-[0_0_30px_rgba(255,179,0,0.4)]">
            {otpStep ? <ShieldCheck className="w-7 h-7 text-black" /> : <UserPlus className="w-7 h-7 text-black" />}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{otpStep ? 'Verify Email' : 'Create Account'}</h1>
          <p className="text-sm sm:text-base text-gray-400">{otpStep ? 'Enter the code sent to your email.' : 'Join Elite Bike Rentals and start your journey.'}</p>
        </div>

        <div className="glass rounded-2xl p-5 sm:p-8 border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {message && (
            <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </div>
          )}

          {!otpStep ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      id="signup-name"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFB300] focus:bg-black/60 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      id="signup-email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFB300] focus:bg-black/60 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="signup-password"
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-11 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFB300] focus:bg-black/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-600">We will verify this email with an OTP before account creation.</p>
                </div>

                <button
                  type="submit"
                  id="signup-submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] rounded-lg text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,106,0,0.3)]"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-[0.25em] text-gray-500">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <AuthGoogleButton
                enabled={googleEnabled}
                loading={googleLoading}
                mode="signup"
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed. Please try again.')}
              />
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">One-Time Password</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                    setMessage('');
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-center tracking-[0.45em] text-xl placeholder-gray-600 focus:outline-none focus:border-[#FFB300] focus:bg-black/60 transition-all"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] rounded-lg text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="flex items-center justify-between gap-4 text-sm">
                <button type="button" onClick={handleResendOtp} className="text-[#FFB300] hover:underline disabled:opacity-50" disabled={otpLoading}>
                  Resend OTP
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => {
                    setOtpStep(false);
                    setOtp('');
                    setError('');
                    setMessage('');
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FFB300] hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
