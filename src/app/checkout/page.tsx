"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Landmark, CreditCard, Wallet, QrCode, Lock, Check, X, Mail } from 'lucide-react';
import { Room } from '@/types';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = searchParams?.get('roomId') || '1';
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [roomUnavailable, setRoomUnavailable] = useState(false);

  React.useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then((data: any) => {
        const mapped = data.map((r: any) => ({
          id: r.id.toString(),
          name: `Room ${r.room_number} - ${r.type}`,
          price: `Rp ${Number(r.price).toLocaleString('id-ID')}/mo`,
          status: r.status,
          features: r.features,
          imageUrl: r.imageUrl
        }));
        setRooms(mapped);
        const selected = mapped.find((r: Room) => r.id === roomId) || mapped[0];
        setRoom(selected);
        // If room is not available, redirect back
        if (selected && selected.status?.toLowerCase() !== 'available') {
          setRoomUnavailable(true);
          alert('This room is no longer available for booking.');
          router.push('/');
        }
      });
  }, [roomId, router]);

  const pricePerMonth = room ? parseInt(room.price.replace(/[^0-9]/g, '')) || 1000000 : 1000000;
  const serviceFee = 50000;
  const totalCost = pricePerMonth + serviceFee;

  // Form states (empty by default so user types real info)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [moveInDate, setMoveInDate] = useState('');

  // Selected payment method state (hardcoded since UI is removed)
  const paymentMethod = 'bank_transfer';

  const [loading, setLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleConfirmAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    
    if (!moveInDate) {
      alert('Please select your move-in date.');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        roomId: room.id,
        fullName,
        email,
        phone,
        idNumber,
        moveInDate,
        paymentMethod,
        totalCost
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setIsSuccessOpen(true);
      } else {
        alert(`Checkout failed: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading room details...</div>;
  }

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

                {/* Move-In Date */}
                <div className="sm:col-span-2">
                  <label htmlFor="moveInDate" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Expected Move-In Date
                  </label>
                  <input
                    id="moveInDate"
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  />
                  <p className="mt-1.5 text-[10px] sm:text-xs text-slate-500 font-medium">
                    This date will be used as your monthly billing cycle date.
                  </p>
                </div>
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
                  <span className="text-slate-800 font-bold">Rp {pricePerMonth.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Service Fee</span>
                  <span className="text-slate-800 font-bold">Rp {serviceFee.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-base font-extrabold text-slate-900">Total</span>
                <span className="text-2xl font-black text-blue-900">Rp {totalCost.toLocaleString('id-ID')}</span>
              </div>

              {/* Final Actions */}
              <form onSubmit={handleConfirmAndPay} className="pt-2 space-y-3.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Create an Account &amp; Pay
                    </>
                  )}
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>

      {/* Success Modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-500 p-6 flex flex-col items-center justify-center relative">
              <button 
                onClick={() => {
                  setIsSuccessOpen(false);
                  router.push('/');
                  router.refresh();
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-emerald-600/30 text-white hover:bg-emerald-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black text-white text-center">Account Created!</h3>
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <p className="text-slate-600 font-medium mb-6">
                Your reservation is now pending admin approval. <strong className="text-slate-800">Check your email</strong> (including the spam/junk folder) to get your password once approved.
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => window.open('https://mail.google.com/', '_blank')}
                  className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Open Gmail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessOpen(false);
                    router.push('/');
                    router.refresh();
                  }}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
