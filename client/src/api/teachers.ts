import client from './axios';
import type { Teacher } from '../types';

export const getTeachersRequest = async () => client.get<Teacher[]>('/teachers');

export const createTeacherRequest = async (teacher: Omit<Teacher, '_id' | 'isActive'>) => 
  client.post<Teacher>('/teachers', teacher);

export const updateTeacherRequest = async (id: string, teacher: Partial<Teacher>) => 
  client.put<Teacher>(`/teachers/${id}`, teacher);

export const deleteTeacherRequest = async (id: string) => 
  client.delete(`/teachers/${id}`);