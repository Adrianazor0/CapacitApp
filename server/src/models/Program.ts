import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
  code: string; // Nuevo: Código interno (ej: DEV-101)
  name: string;
  description?: string;
  type: 'Curso' | 'Diplomado' | 'Taller' | 'Seminario';
  level: 'Básico' | 'Intermedio' | 'Avanzado'; // Nuevo
  cost: number;
  paymentType: 'unico' | 'cuotas';
  isActive: boolean; // Vital para soft delete
}

const ProgramSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['Curso', 'Diplomado', 'Taller', 'Seminario'], 
    required: true 
  },
  level: { 
    type: String, 
    enum: ['Básico', 'Intermedio', 'Avanzado'], 
    default: 'Básico' 
  },
  cost: { type: Number, required: true, min: 0 },
  paymentType: { type: String, enum: ['unico', 'cuotas'], default: 'unico' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Program = mongoose.model<IProgram>('Program', ProgramSchema);