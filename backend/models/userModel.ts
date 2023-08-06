import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  email: string;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
