import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Eye, EyeOff, Save, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Profile form
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/auth/me', {
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      const updatedUser = res.data.data.user ?? res.data.data;
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      // Update token if returned
      if (res.data.data?.token) {
        localStorage.setItem('token', res.data.data.token);
      }
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account information and password</p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-text">Personal Information</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-5">
          {/* Email (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full h-11 pl-11 pr-4 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
            <span className="text-xs text-slate-400">Email cannot be changed</span>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full h-11 pl-11 pr-4 text-sm rounded-lg border border-slate-200 bg-white text-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full h-11 pl-11 pr-4 text-sm rounded-lg border border-slate-200 bg-white text-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                minLength={10}
                maxLength={20}
                className="w-full h-11 pl-11 pr-4 text-sm rounded-lg border border-slate-200 bg-white text-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary border-none cursor-pointer hover:bg-primary/90 transition-colors shadow-sm ${
                profileSaving ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {profileSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold text-text">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">Current Password</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                className="w-full h-11 pl-11 pr-11 text-sm rounded-lg border border-slate-200 bg-white text-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0 flex hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">New Password</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new password"
                className="w-full h-11 pl-11 pr-11 text-sm rounded-lg border border-slate-200 bg-white text-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0 flex hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            <span className="text-xs text-slate-400">Min 8 chars, with uppercase, lowercase, number &amp; special character.</span>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmNewPassword" className="text-sm font-semibold text-slate-700">Confirm New Password</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter new password"
                className="w-full h-11 pl-11 pr-4 text-sm rounded-lg border border-slate-200 bg-white text-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-amber-500 border-none cursor-pointer hover:bg-amber-600 transition-colors shadow-sm ${
                passwordSaving ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {passwordSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
        <p className="text-xs text-slate-400">
          Account created on {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} • Role: <span className="font-semibold capitalize">{user?.role}</span>
        </p>
      </div>
    </div>
  );
}
