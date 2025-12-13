'use client';

import { Mail } from 'lucide-react';

interface ProfileSettingsProps {
  userEmail: string;
}

export function ProfileSettings({ userEmail }: ProfileSettingsProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="text-lg font-medium">{userEmail.split('@')[0]}</h4>
          <p className="text-[var(--muted-foreground)]">{userEmail}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)]">
            <Mail className="w-5 h-5" />
            {userEmail}
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            type="text"
            defaultValue={userEmail.split('@')[0]}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell us a little about yourself..."
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="pt-4">
          <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}