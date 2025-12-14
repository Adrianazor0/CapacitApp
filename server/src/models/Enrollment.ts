import mongoose, {Schema, Document, Types} from "mongoose";

export interface IEnrollment extends Document {
    student: Types.ObjectId;
    group: Types.ObjectId;
    status: "Inscrito" | "Retirado" | "Aprobado" | "Reprobado";
    grades: { note: string, value: number }[];
    finalGrade?: number;
    totalPaid: number;
}

const EnrollmentSchema: Schema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    status: { 
        type: String,
        enum: ["Inscrito", "Retirado", "Aprobado", "Reprobado"],
        default: "Inscrito" },
    grades: [{ note: String, value: Number }],
    finalGrade: Number,
    totalPaid: { type: Number, default: 0 }
}, {
    timestamps: true,
});

EnrollmentSchema.index({ student: 1, group: 1} , {unique: true})

export const Enrollment = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);