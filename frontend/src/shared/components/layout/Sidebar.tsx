import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  BookOpen,
  Library,
  Tag,
  Users,
  Bell,
  User,
  Star,
} from 'lucide-react';
import { NavigationItem } from './NavigationItem';
import { cn } from '@/shared/utils/cn';

export interface SidebarProps {
  userRoles?: string[];
  onNavClick?: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href:  '/dashboard',
    label: 'Dashboard',
    icon:  <LayoutDashboard className="w-5 h-5" />,
    exact: true,
  },
  {
    href:  '/articles',
    label: 'Articles',
    icon:  <FileText className="w-5 h-5" />,
    roles: ['admin', 'editor', 'author'],
  },
  {
    href:  '/assignments',
    label: 'Assignments',
    icon:  <ClipboardCheck className="w-5 h-5" />,
    roles: ['reviewer', 'editor', 'admin'],
  },
  {
    href:  '/reviews',
    label: 'Reviews',
    icon:  <Star className="w-5 h-5" />,
    roles: ['reviewer', 'editor', 'admin'],
  },
  {
    href:  '/journal',
    label: 'Publications',
    icon:  <BookOpen className="w-5 h-5" />,
  },
  {
    href:  '/publications',
    label: 'Publish queue',
    icon:  <Library className="w-5 h-5" />,
    roles: ['admin', 'editor'],
  },
  {
    href:  '/categories',
    label: 'Categories',
    icon:  <Tag className="w-5 h-5" />,
    roles: ['admin', 'editor'],
  },
  {
    href:  '/users',
    label: 'Users',
    icon:  <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    href:  '/notifications',
    label: 'Notifications',
    icon:  <Bell className="w-5 h-5" />,
  },
  {
    href:  '/profile',
    label: 'Profile',
    icon:  <User className="w-5 h-5" />,
  },
];

export function Sidebar({ userRoles = [], onNavClick, className }: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((r) => userRoles.includes(r));
  });

  return (
    <aside
      className={cn(
        'w-64 h-full bg-navy-900 border-r border-white/10 flex flex-col',
        className
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <p className="text-base font-bold text-white font-primary leading-none">DevWeb Journal</p>
        <p className="text-xs text-slate-400 mt-0.5">Editorial System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <NavigationItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Footer brand strip */}
      <div className="px-5 py-3 border-t border-white/10 shrink-0">
        <p className="text-xs text-slate-500">Academic Journal Platform</p>
      </div>
    </aside>
  );
}
