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
    name: string;
    type: "Curso" | "Diplomado" | "Taller" | "Seminario";
    cost: number;
    paymentType: "unico" | "cuotas";
    description?: string;
    isActive: boolean;
}

export interface Teacher {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  speciality: string;
  isActive: boolean;
}

export interface Classroom {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

export interface Student {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  documentId: string;
  phone?: string;
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
