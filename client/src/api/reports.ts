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

export const getPaymentsReportRequest = async (startDate: string, endDate: string) => 
  client.get(`/reports/payments?startDate=${startDate}&endDate=${endDate}`);

export const getDebtorsReportRequest = async () => 
  client.get('/reports/debtors');