import mongoose, { Schema, Document} from "mongoose";

export interface IProgram extends Document {
    name: string;
    description?: string;
    type: "Curso" | "Diplomado" | "Taller" | "Seminario";
    cost: number;
    paymentType: "unico" | "cuotas";
    durationHours: number; 
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProgramSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ["Curso", "Diplomado", "Taller", "Seminario"], required: true },
    cost: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["unico", "cuotas"], default: "unico" },
    durationHours: { type: Number },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

export const Program = mongoose.model<IProgram>("Program", ProgramSchema);