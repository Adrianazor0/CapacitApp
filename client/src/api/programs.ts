import client from "./axios";
import type { Program } from "../types";

export const getProgramsRequest = async () => {
    return client.get<Program[]>("/programs");
}

export const createProgramRequest = async (program: Omit<Program, '_id' | 'isActive'>) => 
  client.post<Program>('/programs', program);