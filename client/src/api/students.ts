import client from './axios';
import type { Student } from '../types';

export const getStudentsRequest = async () => client.get<Student[]>('/students');

export const createStudentRequest = async (data: Omit<Student, '_id' | 'isActive'>) => 
  client.post<Student>('/students', data);

export const updateStudentRequest = async (id: string, student: Partial<Student>) => 
  client.put<Student>(`/students/${id}`, student);

export const deleteStudentRequest = async (id: string) => 
  client.delete(`/students/${id}`);