import mongoose, { Schema, Document} from "mongoose";

export interface ITeacher extends Document {
    name: string;
    lastName: string;
    speciality: string;
    email: string;
    isActive: boolean;
}

const TeacherSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    speciality: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

export const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);