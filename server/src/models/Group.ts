import mongoose, {Schema, Document, Types} from "mongoose";
import { IProgram } from "./Program";
import { ITeacher } from "./Teacher";
import { IClassroom } from "./Classroom";
import { IStudent } from "./Student";

interface ISchedule {
    day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
    startTime: string; 
    endTime: string;   
}

export interface IGroup extends Document {
    code: string;
    program: Types.ObjectId | IProgram;
    teacher: Types.ObjectId | ITeacher;
    classroom: Types.ObjectId | IClassroom;
    students: Types.ObjectId[] | IStudent[];
    schedule: ISchedule[];
    startDate: Date;
    endDate: Date;
    status: "Activo" | "Finalizado" | "Cancelado";
}

const GroupSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, trim: true },
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    schedule: [{
        day: { type: String, enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"], required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },  
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Activo", "Finalizado", "Cancelado"], default: "Activo" }
}, {
    timestamps: true,
});

export const Group = mongoose.model<IGroup>("Group", GroupSchema);