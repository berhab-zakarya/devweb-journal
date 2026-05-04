import { Badge } from './Badge';

export type Role = 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

const roleConfig: Record<Role, { label: string; className: string }> = {
  admin:    { label: 'Admin',    className: 'bg-purple-100 text-purple-700' },
  editor:   { label: 'Editor',   className: 'bg-blue-100   text-blue-700'   },
  reviewer: { label: 'Reviewer', className: 'bg-teal-100   text-teal-700'   },
  author:   { label: 'Author',   className: 'bg-orange-100 text-orange-700' },
  reader:   { label: 'Reader',   className: 'bg-slate-100  text-slate-600'  },
};

export interface RoleBadgeProps {
  role: Role;
  pill?: boolean;
}

export function RoleBadge({ role, pill = false }: RoleBadgeProps) {
  const config = roleConfig[role] ?? roleConfig.reader;
  return (
    <Badge className={config.className} pill={pill}>
      {config.label}
    </Badge>
  );
}
