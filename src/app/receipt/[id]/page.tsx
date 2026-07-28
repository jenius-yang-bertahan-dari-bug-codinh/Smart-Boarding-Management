"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPaymentById } from '@/app/actions/billing';
import { Printer } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ReceiptPage() {
  const params = useParams();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = idStr ? parseInt(idStr, 10) : 0;
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id > 0) {
      getPaymentById(id).then(res => {
        if (res.success) {
          setPayment(res.data);
          // Wait a tiny bit for render, then trigger print
          setTimeout(() => {
            window.print();
          }, 300);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading receipt...</div>;
  if (!payment) return <div className="p-10 text-center font-bold text-red-500">Receipt not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white text-slate-900 font-sans p-8">
      
      {/* Hide this print button when printing */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-end print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white print:shadow-none shadow-xl border border-slate-200 print:border-none p-10 rounded-2xl relative overflow-hidden">
        
        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Papikost</h1>
              <p className="text-xs text-slate-500 font-semibold">Premium Boarding House Management</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-300 uppercase tracking-widest mb-2">RECEIPT</h2>
            <p className="text-xs font-bold text-slate-600">ID: #{payment.id.toString().padStart(6, '0')}</p>
            <p className="text-xs font-bold text-slate-600">Date: {new Date(payment.payment_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Billed To */}
        <div className="flex justify-between mb-10">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Billed To</h3>
            <p className="text-base font-bold text-slate-900">{payment.member?.name || 'Guest'}</p>
            <p className="text-sm font-semibold text-slate-600">{payment.member?.email}</p>
            <p className="text-sm font-semibold text-slate-600">{payment.member?.phone}</p>
            {payment.member?.room && (
              <p className="text-sm font-bold text-slate-700 mt-2 bg-slate-100 px-2 py-1 inline-block rounded-md">Room {payment.member.room.room_number}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Payment Info</h3>
            <p className="text-sm font-semibold text-slate-600">Method: <span className="font-bold text-slate-900">{payment.payment_method || 'Online'}</span></p>
            <p className="text-sm font-semibold text-slate-600">Status: <span className="font-bold text-emerald-600 uppercase">Paid</span></p>
            <p className="text-sm font-semibold text-slate-600">Ref: <span className="font-mono text-xs">{payment.gateway_reference || '-'}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase">Description</th>
                <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 text-sm font-bold text-slate-800">
                  Room Rental - {payment.billing_month || 'General Payment'}
                </td>
                <td className="py-4 px-4 text-sm font-black text-slate-900 text-right">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-500">Subtotal</span>
              <span className="text-sm font-bold text-slate-900">Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-500">Tax & Fees</span>
              <span className="text-sm font-bold text-slate-900">Rp 0</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-lg font-extrabold text-slate-900">Total Paid</span>
              <span className="text-2xl font-black text-blue-900">Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 mb-1">Thank you for your payment!</p>
          <p className="text-xs font-medium text-slate-400">This receipt is a valid proof of payment automatically generated by the system.</p>
        </div>

      </div>
    </div>
  );
}
