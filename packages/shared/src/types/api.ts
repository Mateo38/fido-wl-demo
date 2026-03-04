export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminDashboard {
  totalUsers: number;
  totalPasskeys: number;
  totalAuthentications: number;
  successRate: number;
  recentActivity: { date: string; registrations: number; authentications: number }[];
  passkeysByDevice: { device_type: string; count: number }[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  database: { connected: boolean; latency: number };
  memory: { used: number; total: number; percentage: number };
  timestamp: string;
}
