import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroom extends Document {
  name: string;       // Ej: "Laboratorio A", "Sala Virtual 1"
  type: 'Física' | 'Virtual';
  capacity: number;
  location?: string;  // Solo para físicas (Edificio, Piso)
  resources?: string[]; // Ej: ['Proyector', 'PC', 'Aire']
  platform?: string;  // Solo para virtuales (Google Meet, Zoom)
  meetingLink?: string; // El link de la reunión
  isActive: boolean;
}

const ClassroomSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Física', 'Virtual'], default: 'Física' },
  capacity: { type: Number, required: true, min: 1 },
  location: { type: String }, // Opcional si es virtual
  resources: [{ type: String }],
  platform: { type: String },
  meetingLink: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Classroom = mongoose.model<IClassroom>('Classroom', ClassroomSchema);
