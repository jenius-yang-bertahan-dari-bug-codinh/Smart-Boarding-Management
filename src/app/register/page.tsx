"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye, EyeOff, ArrowRight, ArrowLeft,
  User, Mail, Phone, CreditCard, Lock, CheckCircle2,
  Home as HomeIcon, Tag,
} from 'lucide-react';
import Logo from '@/components/Logo';

const steps = ['Akun', 'Kamar & Tanggal', 'Identitas', 'Konfirmasi'];

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Room selection from query params (passed from Book Now button)
  const selectedRoomId = searchParams.get('roomId') || '';
  const selectedRoomName = searchParams.get('roomName') || '';
  const selectedRoomPrice = searchParams.get('roomPrice') || '';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    id_number: '',
    join_date: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return 'Nama lengkap wajib diisi.';
      if (!form.email.trim()) return 'Email wajib diisi.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Format email tidak valid.';
      if (form.password.length < 8) return 'Password minimal 8 karakter.';
      if (form.password !== form.confirmPassword) return 'Konfirmasi password tidak cocok.';
    }
    if (step === 1) {
      if (!form.join_date) return 'Tanggal masuk wajib diisi.';
    }
    if (step === 2) {
      if (!form.phone.trim()) return 'Nomor HP wajib diisi.';
      if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) return 'Format nomor HP tidak valid.';
      if (!form.id_number.trim()) return 'Nomor KTP wajib diisi.';
      if (form.id_number.replace(/\s/g, '').length < 16) return 'Nomor KTP harus 16 digit.';
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          id_number: form.id_number.replace(/\s/g, ''),
          join_date: form.join_date,
          // Pass preferred room so admin can see which room user wants
          preferred_room_id: selectedRoomId ? parseInt(selectedRoomId) : null,
          preferred_room_name: selectedRoomName || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
        setLoading(false);
      }
    } catch {
      setError('Koneksi gagal. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium';

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-blue-500 selection:text-white relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background glows */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Back nav */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href={selectedRoomId ? `/?scrollTo=rooms` : '/login'}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
          <span>{selectedRoomId ? 'Kembali ke Daftar Kamar' : 'Kembali ke Login'}</span>
        </Link>
      </div>

      {/* Card */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 z-10 mt-8 sm:mt-0">

        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo size={44} className="mb-3" />
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Daftar Sebagai Resident</h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">
            Isi data di bawah untuk memulai proses pendaftaran kos
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-7">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${i < step ? 'bg-emerald-500 text-white' :
                      i === step ? 'bg-blue-900 text-white' :
                        'bg-slate-100 text-slate-400'}`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-semibold ${i === step ? 'text-blue-900' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mt-[-12px] transition-colors ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium text-center mb-5">
            {error}
          </div>
        )}

        {/* ── Step 0: Akun ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={e => updateForm('password', e.target.value)}
                  className={`${inputClass} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={e => updateForm('confirmPassword', e.target.value)}
                  className={`${inputClass} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-2 bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer text-sm"
            >
              Lanjut <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 1: Identitas ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">Nomor HP / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="contoh: 08123456789"
                  value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                Nomor KTP <span className="text-orange-500">(16 digit)</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-ktp"
                  type="text"
                  placeholder="xxxx xxxx xxxx xxxx"
                  maxLength={19}
                  value={form.id_number}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                    updateForm('id_number', formatted);
                  }}
                  className={`${inputClass} pl-10 tracking-widest`}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-0.5">
                Data KTP digunakan untuk verifikasi identitas oleh admin.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setStep(0); setError(''); }}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                Lanjut <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Konfirmasi ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room selection summary — only show if came from Book Now */}
            {selectedRoomName && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3">
                <HomeIcon className="w-4 h-4 text-blue-700 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Kamar Pilihan</p>
                  <p className="text-xs font-extrabold text-blue-900 truncate">{selectedRoomName}</p>
                </div>
                <span className="ml-auto text-xs font-bold text-blue-700 shrink-0">{selectedRoomPrice}</span>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ringkasan Data</h3>
              {[
                { label: 'Nama Lengkap', value: form.name, icon: <User className="w-3.5 h-3.5" /> },
                { label: 'Email', value: form.email, icon: <Mail className="w-3.5 h-3.5" /> },
                { label: 'Nomor HP', value: form.phone, icon: <Phone className="w-3.5 h-3.5" /> },
                { label: 'Nomor KTP', value: form.id_number, icon: <CreditCard className="w-3.5 h-3.5" /> },
                { label: 'Tanggal Masuk', value: form.join_date, icon: <HomeIcon className="w-3.5 h-3.5" /> },
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-800 font-bold truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3.5">
              <p className="text-xs text-orange-700 font-medium leading-relaxed">
                📋 Setelah mendaftar, akun Anda akan berstatus <strong>Pending</strong>. Admin akan memverifikasi data dan mengassign kamar untuk Anda
                {selectedRoomName ? <> (<strong>{selectedRoomName}</strong>)</> : ''}.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-70 text-sm"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}

        {/* Login link */}
        <p className="text-center text-xs text-slate-500 font-medium mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-700 hover:text-blue-900 font-bold hover:underline transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}

// Wrap with Suspense because useSearchParams requires it in Next.js App Router
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">
        Loading...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
