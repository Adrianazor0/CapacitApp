import mongoose, { Schema, Document} from "mongoose";

export interface IClassroom extends Document {
    name: string;
    capacity: number;
    location?: string;
    isActive: boolean;
}

const ClassroomSchema: Schema = new Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    location: { type: String },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

export const Classroom = mongoose.model<IClassroom>("Classroom", ClassroomSchema);