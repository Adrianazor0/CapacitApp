import client from './axios';
import type { Enrollment } from '../types';

export const getGroupFinancialsRequest = async (groupId: string) => 
  client.get<Enrollment[]>(`/finances/groups/${groupId}`);

export const enrollStudentRequest = async (data: { studentId: string; groupId: string }) => 
  client.post<Enrollment>('/finances/enroll', data);

export const addPaymentRequest = async (data: { enrollmentId: string; amount: number; method: string }) => 
  client.post('/finances/pay', data);

export const addGradeRequest = async (data: { enrollmentId: string; note: string; value: number }) => 
  client.post('/finances/grades', data);

export const getRecentTransactionsRequest = async () => 
  client.get('/finances/transactions');