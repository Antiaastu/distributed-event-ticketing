'use client';

import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export function SecuritySettings() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Security Settings</h3>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              placeholder="Enter current password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              placeholder="Enter new password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              placeholder="Confirm new password"
              required
            />
          </div>
        </div>

        {message && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}