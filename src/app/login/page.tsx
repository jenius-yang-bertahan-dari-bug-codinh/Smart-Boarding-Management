"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ScanFace, Fingerprint, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.user?.role === 'admin' || email.toLowerCase().includes('admin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-blue-500 selection:text-white relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Soft, diffused light orange glow effect behind the lower-right of the login panel */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Sleek Floating Top Back Navigation */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Central Login Panel */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 sm:p-10 z-10">
        
        {/* Panel Title & Subtitle */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={48} className="mb-3" />
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Papikost
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1.5">
            Member Portal Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium text-center">
              {error}
            </div>
          )}

          {/* Email or Member ID Field */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5"
            >
              Email or Member ID
            </label>
            <input
              id="email"
              type="text"
              required
              placeholder="Enter your credentials"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="password" 
                className="block text-slate-700 text-xs sm:text-sm font-semibold"
              >
                Password
              </label>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotEmail(email);
                  setForgotSuccess(false);
                  setIsForgotOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors text-xs font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5 stroke-[1.8]" />
                ) : (
                  <Eye className="w-4.5 h-4.5 stroke-[1.8]" />
                )}
              </button>
            </div>
          </div>

          {/* Main Button (Sign In) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0.5 cursor-pointer disabled:opacity-85 text-sm sm:text-base"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4.5 h-4.5 stroke-[2.2]" />}
          </button>
        </form>

      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base">Reset Your Password</h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsForgotOpen(false); setForgotSuccess(false); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {forgotSuccess ? (
                <div className="text-center py-4 space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">Check Your Gmail!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We are preparing our live Gmail / SMTP server integration. When activated, a confirmation link &amp; OTP will be sent directly to <span className="font-bold text-blue-900">{forgotEmail}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setIsForgotOpen(false); setForgotSuccess(false); }}
                    className="w-full mt-3 bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!forgotEmail) return;
                    setForgotSuccess(true);
                  }} 
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your registered email address below. Once connected to Gmail SMTP, we will send a password reset link directly to your inbox to securely recover your account.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gmail / Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800"
                    />
                  </div>
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Send Gmail Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
