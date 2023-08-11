import mongoose, { Schema, Document } from 'mongoose';

export interface UserSlots extends Document {
  user_id: mongoose.Types.ObjectId;
  scheduled_start_datetime: Date;
  scheduled_end_datetime: Date;
  status: string;
  message: string;
}

const userSlotsSchema: Schema = new Schema({
  user_id: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  scheduled_start_datetime: { type: Date, required: true },
  scheduled_end_datetime: { type: Date, required: true },
  status: { type: String, required: true },
  message: { type: String, default: '' },
});

const UserSlotsModel = mongoose.model<UserSlots>('UserSlots', userSlotsSchema);

export default UserSlotsModel;
