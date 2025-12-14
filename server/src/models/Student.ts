import mongoose, { Schema, Document} from "mongoose";

export interface IStudent extends Document {
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    documentId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    phone: { type: String },
    documentId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

export const Student = mongoose.model<IStudent>("Student", StudentSchema);