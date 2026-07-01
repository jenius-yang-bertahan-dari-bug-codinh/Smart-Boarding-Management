"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ScanFace, Fingerprint, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Authentication Logic
    setTimeout(() => {
      setLoading(false);
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }, 1000);
  };

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-blue-500 selection:text-white relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Soft, diffused light orange glow effect behind the lower-right of the login panel */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Top Text Annotation: At the very top of the page */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <span className="text-slate-300 text-xs">|</span>
        <h1 className="text-sm font-bold text-blue-600 tracking-wide">
          SmartStay - Member Login (Light Theme)
        </h1>
      </div>

      {/* Central Login Panel */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 sm:p-10 z-10">
        
        {/* Panel Title & Subtitle */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={48} className="mb-3" />
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            SmartStay
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1.5">
            Member Portal Access
          </p>
          <p className="text-[10px] font-bold text-orange-500 mt-3 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            Mock: Type "admin" in email to access Admin Panel
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
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 transition-colors text-xs font-semibold hover:underline"
              >
                Forgot Password?
              </a>
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

        {/* Separator */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-200/80 w-full"></div>
          <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Or Continue With
          </span>
        </div>

        {/* Alternative Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => alert('Initiating Face ID scan...')}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer"
          >
            <ScanFace className="w-4 h-4 text-slate-500 stroke-[1.8]" />
            <span>Face ID</span>
          </button>
          <button 
            type="button"
            onClick={() => alert('Initiating Touch ID fingerprint scan...')}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-slate-500 stroke-[1.8]" />
            <span>Touch ID</span>
          </button>
        </div>

        {/* Security Note / Footer */}
        <div className="text-center mt-8 text-[11px] sm:text-xs text-slate-400 font-medium">
          <span>Secure connection standard. </span>
          <a href="#" className="text-blue-600 hover:underline hover:text-blue-700 transition-colors">
            Privacy Policy
          </a>
          <span>.</span>
        </div>

      </div>
    </main>
  );
}
