import mongoose, { Schema, Document} from "mongoose";
import bcrypt from "bcryptjs"

export interface IUser extends Document {
    username: string;
    password: string;
    role: "Admin" | "Profesor" | "Cajero";
    matchPassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Profesor", "Cajero"], default: "Profesor" }
}, {
    timestamps: true,
});

UserSchema.pre("save", async function () {
    const user = this as unknown as IUser;

    if(!user.isModified("password")) {
        return;
    };

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt)   
})

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);