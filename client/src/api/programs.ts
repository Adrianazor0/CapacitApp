import client from "./axios";
import type { Program } from "../types";

export const getProgramsRequest = async () => {
    return client.get<Program[]>("/programs");
}

export const createProgramRequest = async (program: Omit<Program, '_id' | 'isActive'>) => 
  client.post<Program>('/programs', program);

export const updateProgramRequest = async (id: string, program: Partial<Program>) => 
  client.put<Program>(`/programs/${id}`, program);

// Eliminar (Toggle status)
export const deleteProgramRequest = async (id: string) => 
  client.delete(`/programs/${id}`);