import client from './axios';
import type { Group } from '../types';

export const getGroupsRequest = async () => client.get<Group[]>('/groups');
export const createGroupRequest = async (data: any) => client.post<Group>('/groups', data);