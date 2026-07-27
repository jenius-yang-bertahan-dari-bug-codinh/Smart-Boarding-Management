"use client";

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, UploadCloud, User, Lock, Eye, EyeOff } from 'lucide-react';
import { validateClientImageFile } from '@/lib/file-security';
import { changePassword } from '@/app/actions/auth';

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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      if (!data.success) {
        alert(data.error || 'Failed to update profile');
        setIsSaving(false);
        return;
      }

      // Handle password change if requested
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
          alert('Please enter your current password.');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          alert('New passwords do not match.');
          setIsSaving(false);
          return;
        }
        
        const resPass = await changePassword({ userId: user.id, currentPassword, newPassword });
        if (!resPass.success) {
          alert(resPass.error);
          setIsSaving(false);
          return;
        }
      }

      setToastMsg('Settings updated successfully!');
      await onRefresh();
      
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setToastMsg('');
        onClose();
      }, 1500);
      
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
                {editAvatar ? (
                  <img
                    src={editAvatar}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-md bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-md shrink-0 bg-slate-200 flex items-center justify-center text-slate-800">
                    <User className="w-10 h-10" />
                  </div>
                )}
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

              {/* Security / Change Password Section */}
              <div className="pt-3 border-t border-slate-100 mt-4 space-y-3.5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Change Password</span>
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password (min. 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
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
