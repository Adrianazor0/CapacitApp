import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  lastName: string;
  documentId: string; // Nuevo: DNI/Cédula
  email: string;
  phone?: string;     // Nuevo
  speciality: string; // Ej: "Matemáticas", "Desarrollo Web"
  degree?: string;    // Nuevo: "Licenciado", "Ingeniero", "PhD"
  address?: string;   // Nuevo
  hireDate?: Date;    // Nuevo
  isActive: boolean;
}

const TeacherSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  documentId: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String },
  speciality: { type: String, required: true },
  degree: { type: String },
  address: { type: String },
  hireDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);