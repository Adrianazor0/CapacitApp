import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  lastName: string;
  email: string;
  documentId: string; // DNI/Cédula
  phone?: string;
  birthDate?: Date;   // Nuevo
  gender?: 'M' | 'F' | 'Otro'; // Nuevo
  address?: string;   // Nuevo
  emergencyContact?: { // Nuevo: Objeto anidado
    name: string;
    phone: string;
  };
  isActive: boolean;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  documentId: { type: String, required: true, unique: true, trim: true },
  phone: { type: String },
  birthDate: { type: Date },
  gender: { type: String, enum: ['M', 'F', 'Otro'] },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);