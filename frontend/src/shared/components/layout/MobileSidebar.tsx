'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Sidebar } from './Sidebar';

export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  userRoles?: string[];
}

export function MobileSidebar({ open, onClose, userRoles }: MobileSidebarProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64',
          'transition-transform duration-200 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="relative flex-1 flex flex-col">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute top-4 right-3 z-10 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <Sidebar userRoles={userRoles} onNavClick={onClose} className="h-full" />
        </div>
      </div>
    </>
  );
}
