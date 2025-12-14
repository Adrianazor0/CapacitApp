import client from './axios';
import type { Student } from '../types';

export const getStudentsRequest = async () => client.get<Student[]>('/students');
export const createStudentRequest = async (data: Omit<Student, '_id' | 'isActive'>) => 
  client.post<Student>('/students', data);