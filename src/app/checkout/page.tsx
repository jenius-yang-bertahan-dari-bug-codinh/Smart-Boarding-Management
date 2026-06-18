"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Landmark, CreditCard, Wallet, QrCode, Lock } from 'lucide-react';
import { mockRooms } from '@/data/mockRooms';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Find the selected room or default to Room 101 (id '1')
  const roomId = searchParams?.get('roomId') || '1';
  const room = mockRooms.find((r) => r.id === roomId) || mockRooms[0];

  // Parse numerical price (e.g., "$250/mo" -> 250)
  const pricePerMonth = parseInt(room.price.replace(/[^0-9]/g, '')) || 250;
  const serviceFee = 5;
  const totalCost = pricePerMonth + serviceFee;

  // Form states with pre-filled mock data
  const [fullName, setFullName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@example.com');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [idNumber, setIdNumber] = useState('1234567890123456');

  // Selected payment method state
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const [loading, setLoading] = useState(false);

  const handleConfirmAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Booking confirmed for ${room.name}! Total paid: $${totalCost}.`);
      router.push('/');
    }, 1500);
  };

  return (
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-blue-500 selection:text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation & Headers */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base">
            Complete your booking details and payment.
          </p>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Details & Payment) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Guest Details Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Guest Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>

                {/* ID Number (NIK) */}
                <div>
                  <label htmlFor="idNumber" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    ID Number (NIK)
                  </label>
                  <input
                    id="idNumber"
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-900 bg-blue-50/20 ring-1 ring-blue-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Bank Transfer
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Virtual Account
                    </p>
                  </div>
                </button>

                {/* Credit/Debit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'border-blue-900 bg-blue-50/20 ring-1 ring-blue-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Credit/Debit Card
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Visa, Mastercard
                    </p>
                  </div>
                </button>

                {/* Digital Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('digital_wallet')}
                  className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'digital_wallet'
                      ? 'border-blue-900 bg-blue-50/20 ring-1 ring-blue-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Digital Wallet
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      GoPay, OVO, ShopeePay
                    </p>
                  </div>
                </button>

                {/* QRIS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-blue-900 bg-blue-50/20 ring-1 ring-blue-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      QRIS
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Scan to Pay
                    </p>
                  </div>
                </button>
              </div>

              {/* Secure note */}
              <div className="mt-5 flex items-center gap-2 text-slate-500 text-xs">
                <Lock className="w-3.5 h-3.5 text-blue-900" />
                <span>Payments are secure and encrypted.</span>
              </div>
            </div>

          </div>

          {/* Right Column (Booking Summary) */}
          <div className="lg:col-span-4">
            
            {/* Booking Summary Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
                Booking Summary
              </h2>

              {/* Selected Room Details with Thumbnail */}
              <div className="flex gap-4">
                <img 
                  src={room.imageUrl} 
                  alt={room.name} 
                  className="w-20 h-16 rounded-xl object-cover bg-slate-100 border border-slate-100" 
                />
                <div className="flex flex-col justify-center">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Duration: 1 Month
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Price per month</span>
                  <span className="text-slate-800 font-bold">${pricePerMonth}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Service Fee</span>
                  <span className="text-slate-800 font-bold">${serviceFee}</span>
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-base font-extrabold text-slate-900">Total</span>
                <span className="text-2xl font-black text-blue-900">${totalCost}</span>
              </div>

              {/* Final Actions */}
              <form onSubmit={handleConfirmAndPay} className="pt-2 space-y-3.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0.5 cursor-pointer disabled:opacity-85 text-sm sm:text-base"
                >
                  <span>{loading ? 'Processing...' : 'Confirm and Pay'}</span>
                  {!loading && <ArrowRight className="w-4.5 h-4.5 stroke-[2.2]" />}
                </button>

                <p className="text-[11px] text-slate-400 text-center font-medium leading-relaxed">
                  By confirming, you agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline hover:text-blue-700 transition-colors">
                    Terms of Service
                  </a>
                  .
                </p>
              </form>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
