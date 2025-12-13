'use client';

import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';

export function PreferencesSettings() {
  const { theme, toggleTheme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">App Preferences</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center">
              {effectiveTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium">Appearance</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {effectiveTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            Toggle Theme
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-[var(--muted-foreground)]">Receive email updates about your bookings</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--primary)]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}