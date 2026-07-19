"use client";

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, UploadCloud } from 'lucide-react';
import { validateClientImageFile } from '@/lib/file-security';

interface MemberSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onRefresh: () => void | Promise<void>;
}

export default function MemberSettingsModal({ isOpen, onClose, user, onRefresh }: MemberSettingsModalProps) {
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.memberProfile?.phone || '');
      setEditAvatar(user.avatar_url || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Secure validation against double extension attack, MIME spoofing, and 5MB limit
    const validation = await validateClientImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      e.target.value = '';
      return;
    }

    // Read as Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/dashboard/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          avatar_url: editAvatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg('Profile updated successfully!');
        await onRefresh();
        setTimeout(() => {
          setToastMsg('');
          onClose();
        }, 1500);
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-[60] animate-fade-in text-sm font-bold border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-base">Profile & Account Settings</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Profile Photo Preview & Secure File Upload Input */}
            <div className="flex flex-col items-center justify-center pb-3 border-b border-slate-100">
              <div className="relative mb-3">
                <img
                  src={editAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80";
                  }}
                />
              </div>
              <label className="block text-xs font-bold text-slate-700 w-full mb-1">
                Custom Profile Picture (JPG, JPEG, PNG only - Max 5 MB)
              </label>
              <div className="relative w-full">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleAvatarFileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer"
                />
              </div>
            </div>

            {/* Account & Contact Information Section */}
            <div className="space-y-3.5 pt-1">
              {/* 1. Email Address (Primary Login & Recovery) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Email Address (Login &amp; Recovery)</span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">Primary ID</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@gmail.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800"
                />
              </div>

              {/* 2. Username / Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username / Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your username or full name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800"
                />
              </div>

              {/* 3. Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number (WhatsApp Active)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 081234567890"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
