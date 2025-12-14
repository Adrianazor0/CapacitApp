import client from './axios';

export interface DashboardStats {
  totalStudents: number;
  activeGroups: number;
  totalRevenue: number;
  totalDebt: number;
  recentPayments: {
    _id: string;
    amount: number;
    method: string;
    date: string;
    enrollment: {
      student: {
        name: string;
        lastName: string;
      }
    }
  }[];
}

export const getDashboardStatsRequest = async () => 
  client.get<DashboardStats>('/reports/dashboard');
