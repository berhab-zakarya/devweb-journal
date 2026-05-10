'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileSidebar } from './MobileSidebar';
import type { CurrentUser } from './UserMenu';

export interface AppShellProps {
  children: React.ReactNode;
  user?: CurrentUser | null;
  unreadNotifications?: number;
  onLogout?: () => void;
}

export function AppShell({
  children,
  user,
  unreadNotifications = 0,
  onLogout,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRoles = user?.roles ?? [];

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar userRoles={userRoles} />
      </div>

      {/* Mobile sidebar drawer */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userRoles={userRoles}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          user={user}
          unreadNotifications={unreadNotifications}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto app-main-bg px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
