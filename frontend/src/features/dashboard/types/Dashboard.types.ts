export interface DashboardItem {
  key: string;
  label: string;
  count: number;
  route: string;
}

export interface DashboardSummary {
  role: 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';
  requires_attention: DashboardItem[];
  pending: DashboardItem[];
  completed: DashboardItem[];
}
