import client from './axios';
import type { Classroom } from '../types';

export const getClassroomsRequest = async () => client.get<Classroom[]>('/classrooms');
export const createClassroomRequest = async (data: Omit<Classroom, '_id' | 'isActive'>) => 
  client.post<Classroom>('/classrooms', data);