export interface CourierDashboardStats {
  statusCounts: {
    pending: number;
    delivered: number;
    cancelled: number;
    in_review: number;
    return_pending: number;
    returned: number;
    unknown: number;
    sent: number;
    [key: string]: number; // Allow dynamic keys if needed
  };
  accountInfo: {
    currentBalance: number;
  };
}

export interface CourierDashboardStatsResponse {
  success: boolean;
  status: number;
  message: string;
  data: CourierDashboardStats;
}
