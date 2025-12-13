'use client';

import { useState } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Ticket, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Shield
} from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { UserRole } from '../../types';

interface SidebarProps {
  userEmail: string;
  userRole?: UserRole;
  onLogout: () => void;
  activeSection?: string;
  onNavigate?: (section: string) => void;
}

export function Sidebar({ userEmail, userRole = 'user', onLogout, activeSection = 'dashboard', onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';

  const userMenuItems = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Browse Events' },
    { id: 'myevents', icon: <Calendar className="w-5 h-5" />, label: 'My Events' },
    { id: 'mytickets', icon: <Ticket className="w-5 h-5" />, label: 'My Tickets' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const adminMenuItems = [
    { id: 'dashboard', icon: <Shield className="w-5 h-5" />, label: 'Admin Panel' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const organizerMenuItems = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  let menuItems;
  if (userRole === 'admin') {
    menuItems = adminMenuItems;
  } else if (userRole === 'organizer') {
    menuItems = organizerMenuItems;
  } else {
    menuItems = userMenuItems;
  }

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[var(--card)] border-r border-[var(--border)] z-40 transition-all duration-300 shadow-xl
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[var(--foreground)]">TicketHub</h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {userRole === 'admin' ? 'Admin' : 'Dashboard'}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                <ChevronRight className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white flex-shrink-0">
                {userRole === 'admin' ? <Shield className="w-5 h-5" /> : userEmail.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{userEmail.split('@')[0]}</p>
                  <p className="text-xs text-[var(--muted-foreground)] capitalize">{userRole} Account</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${item.id === activeSection
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg'
                        : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-[var(--border)] space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-[var(--muted)]
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {effectiveTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {!isCollapsed && <span>{effectiveTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={`${isCollapsed ? 'lg:w-20' : 'lg:w-72'} transition-all duration-300`}></div>
    </>
  );
}