import client from './axios';
import type { Classroom } from '../types';

export const getClassroomsRequest = async () => client.get<Classroom[]>('/classrooms');

export const createClassroomRequest = async (data: Partial<Classroom>) => 
  client.post<Classroom>('/classrooms', data);

export const updateClassroomRequest = async (id: string, data: Partial<Classroom>) => 
  client.put<Classroom>(`/classrooms/${id}`, data);

export const deleteClassroomRequest = async (id: string) => 
  client.delete(`/classrooms/${id}`);