import mongoose, { Schema, Document, Types} from "mongoose";

export interface IPayment extends Document {
    enrollment: Types.ObjectId;
    ampunt: number;
    date: Date;
    method: "Efectico" | "Tarjeta" | "Transferencia";
}

const PaymentSchema: Schema = new Schema({
    enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now() },
    method: { 
        type: String,
        enum: ["Efectivo", "Tarjeta", "Transferencia"],
        required: true 
    },
}, {
    timestamps: true,
});

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);