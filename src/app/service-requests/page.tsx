"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Megaphone, 
  Settings, 
  AlertTriangle, 
  HelpCircle, 
  LogOut, 
  ChevronDown,
  UploadCloud,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  Droplet,
  CheckCircle,
  FileImage,
  Clock,
  Wrench as WrenchIcon,
  User
} from 'lucide-react';
import Logo from '@/components/Logo';
import MemberSidebar from '@/components/MemberSidebar';
import { validateClientImageFile } from '@/lib/file-security';

export default function ServiceRequests() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const router = useRouter();

  const fetchComplaints = () => {
    fetch('/api/complaints')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((data) => {
        setComplaints(data.complaints);
        setUser(data.user);
        if (data.complaints.length > 0 && !selectedComplaint) {
          setSelectedComplaint(data.complaints[0]);
          setIsDrawerOpen(true);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateClientImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      e.target.value = '';
      return;
    }

    setFileName(validation.sanitizedFileName || file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description, photo_url: photoUrl })
    });
    if (res.ok) {
      alert('Request submitted successfully!');
      setCategory('');
      setDescription('');
      setPhotoUrl(null);
      setFileName(null);
      fetchComplaints();
    } else {
      alert('Failed to submit request');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-semibold text-slate-500">Loading requests...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Left-Side Navigation Sidebar */}
      <MemberSidebar activeTab="Service Requests" user={user} onRefresh={fetchComplaints} />

      {/* Main Right-Side Dashboard Area */}
      <section className="flex-grow p-6 sm:p-8 lg:p-10 overflow-y-auto flex flex-col">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Complaint &amp; Maintenance
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">
              Submit and track your property complaints or maintenance requests.
            </p>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start flex-grow">
          
          {/* Left Block: New Request Form */}
          <div className={`space-y-6 ${isDrawerOpen ? 'xl:col-span-5' : 'xl:col-span-7'}`}>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                New Request
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Issue Category (Complaint/Maintenance)
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium pr-10"
                    >
                      <option value="">Select a category...</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="hvac">HVAC / Air Conditioning</option>
                      <option value="electrical">Electrical</option>
                      <option value="appliance">Appliance Maintenance</option>
                      <option value="other">Other / Complaint</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail, including location and when it started..."
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium resize-none"
                  />
                </div>

                {/* File Dropzone */}
                <div>
                  <label className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1.5">
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    id="attachment-input"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {photoUrl ? (
                    <div className="border-2 border-slate-200 rounded-xl p-4 bg-white flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={photoUrl} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">{fileName || 'Attachment'}</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">Ready to upload</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPhotoUrl(null); setFileName(null); }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="attachment-input"
                      className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer text-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Click to upload image (Max 5 MB)</span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1">JPG, JPEG, or PNG only</span>
                    </label>
                  )}
                </div>

                {/* Cancel & Submit Button */}
                <div className="flex items-center justify-end gap-3.5 pt-3">
                  <button
                    type="button"
                    onClick={() => { setCategory(''); setDescription(''); setPhotoUrl(null); setFileName(null); }}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Center Block: Timeline & History */}
          <div className={`space-y-6 ${isDrawerOpen ? 'xl:col-span-4' : 'xl:col-span-5'}`}>
            
            {/* Timeline Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    REQ-2023-894
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">
                    Request Details: HVAC Maintenance
                  </h3>
                </div>
                <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <MoreVertical className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-6">
                {/* Line background */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                {/* Step 1 */}
                <div className="relative flex items-start gap-3.5">
                  <div className="absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">Request Received</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Oct 24, 09:41 AM</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-3.5">
                  <div className="absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 fill-white" />
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">Assigned to Technician</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Oct 24, 11:30 AM</p>
                    
                    {/* Technician card summary */}
                    <div className="mt-3 flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 max-w-xs">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800">Michael R.</h5>
                        <p className="text-[9px] text-slate-400 font-semibold">HVAC Specialist</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-3.5">
                  <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 border-blue-900 bg-white flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-blue-900">In Progress</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Technician is currently on site.</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-start gap-3.5">
                  <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-400">Resolution</h4>
                    <p className="text-[10px] text-slate-300 font-semibold mt-0.5">Awaiting completion</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent History Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Recent History
              </h2>

              {/* History Item List */}
              {(showAllHistory ? complaints : complaints.slice(0, 3)).map((c) => (
                <div 
                  key={c.id}
                  onClick={() => { setSelectedComplaint(c); setIsDrawerOpen(true); }}
                  className="flex items-center justify-between p-3.5 mt-2 rounded-xl border border-slate-100/80 hover:border-slate-200 bg-slate-50/20 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${c.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      <WrenchIcon className="w-4.5 h-4.5 stroke-[1.8]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                        {c.category}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {c.tracking_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${c.status === 'resolved' ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {c.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition-colors" />
                  </div>
                </div>
              ))}
              {complaints.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-sm font-medium">No requests found.</div>
              )}

              {/* Full History button */}
              {!showAllHistory && complaints.length > 3 && (
                <button 
                  type="button"
                  onClick={() => setShowAllHistory(true)}
                  className="w-full mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all border border-slate-100 cursor-pointer text-center"
                >
                  View All History ({complaints.length})
                </button>
              )}
              {showAllHistory && complaints.length > 3 && (
                <button 
                  type="button"
                  onClick={() => setShowAllHistory(false)}
                  className="w-full mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all border border-slate-100 cursor-pointer text-center"
                >
                  Show Less
                </button>
              )}
            </div>

          </div>

          {/* Right Block: Slide-out Details Drawer (Drawer Column) */}
          {isDrawerOpen && selectedComplaint && (
            <div className="xl:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-md p-6 space-y-5 relative">
              <h2 className="text-sm font-bold text-slate-900 pr-6 block pb-3 border-b border-slate-100">
                Request Details: {selectedComplaint.category}
              </h2>
              
              {/* Resolved Badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${selectedComplaint.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {selectedComplaint.status.toUpperCase()}
                </span>
              </div>

              {/* Request Info Fields */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Request ID</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{selectedComplaint.tracking_id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                  <p className="text-slate-600 font-medium leading-relaxed mt-0.5">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              {/* Resolution Info Details */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3.5 text-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Resolution
                </h3>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Resolution Date</span>
                  <span className="font-bold text-slate-800 block mt-0.5">Sep 12, 2023, 2:30 PM</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Plumbing Technician</span>
                  <span className="font-bold text-slate-800 block mt-0.5">Michael R.</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Actions Taken</span>
                  <p className="text-slate-600 font-medium leading-relaxed mt-0.5">
                    Replaced the worn-out seal on the U-joint. Checked for other leaks and confirmed watertight seal.
                  </p>
                </div>
              </div>

              {/* Photo Attachment / Thumbnails */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Attached Photo
                </h4>
                {selectedComplaint.photo_url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={selectedComplaint.photo_url}
                      alt="Uploaded Request Attachment"
                      className="w-full max-h-56 object-contain rounded-lg bg-slate-900/5"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-3.5 rounded-xl text-center">
                      <FileImage className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500">No photo uploaded</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-center"
              >
                Close Details
              </button>
            </div>
          )}

        </div>

      </section>

    </main>
  );
}
