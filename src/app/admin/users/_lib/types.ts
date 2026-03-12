

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  date_of_birth: string | null;
  phone: string | null;
  timezone: string | null;
  language: string | null;
  is_active: boolean;
  last_login: string | null;
  email_verified: boolean;
  currency_preference: string | null;
  account_setup_completed: boolean;
}

export interface UserFormState {
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'moderator';
  phone: string;
  date_of_birth: string;
  timezone: string;
  language: string;
  currency_preference: string;
  is_active: boolean;
  password?: string;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  month: number | "all";
  year: number | "all";
  dateFrom: string;
  dateTo: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  adminCount: number;
  userGrowth: Array<{ month: string; count: number }>;
  roleDistribution: Array<{ role: string; count: number; percentage: number }>;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
