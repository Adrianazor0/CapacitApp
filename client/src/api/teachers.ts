import client from './axios';
import type { Teacher } from '../types';

export const getTeachersRequest = async () => client.get<Teacher[]>('/teachers');
export const createTeacherRequest = async (teacher: Omit<Teacher, '_id' | 'isActive'>) => 
  client.post<Teacher>('/teachers', teacher);