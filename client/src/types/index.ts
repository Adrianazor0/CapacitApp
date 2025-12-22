export interface User {
    _id: string;
    username: string;
    role: "Admin" | "Profesor" | "Cajero";
}

export interface AuthResponse extends User {
    token: string;
}

export interface Program {
  _id: string;
  code: string; // Nuevo
  name: string;
  type: 'Curso' | 'Diplomado' | 'Taller' | 'Seminario';
  level: 'Básico' | 'Intermedio' | 'Avanzado'; // Nuevo
  cost: number;
  paymentType: 'unico' | 'cuotas';
  description?: string;
  isActive: boolean;
}

export interface Teacher {
  _id: string;
  name: string;
  lastName: string;
  documentId: string;
  email: string;
  phone?: string;
  speciality: string;
  degree?: string;
  address?: string;
  hireDate?: string;
  isActive: boolean;
}

export interface Classroom {
  _id: string;
  name: string;
  type: 'Física' | 'Virtual';
  capacity: number;
  location?: string;
  resources?: string[];
  platform?: string;
  meetingLink?: string;
  isActive: boolean;
}

export interface Student {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  documentId: string;
  phone?: string;
  birthDate?: string; // Recibimos string ISO desde la API
  gender?: 'M' | 'F' | 'Otro';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  isActive: boolean;
}


export interface Group {
  _id: string;
  code: string;
  program: Program;  
  teacher: Teacher;
  classroom: Classroom;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  startDate: string;
  endDate: string;
  status: 'Activo' | 'Finalizado' | 'Cancelado';
}

export interface Enrollment {
  _id: string;
  student: Student; 
  group: string;  
  grades: { note: string, value: number }[];  
  status: 'Inscrito' | 'Retirado' | 'Aprobado';
  totalPaid: number;
  finalGrade?: number;
}
