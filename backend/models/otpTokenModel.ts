import mongoose, { Schema, Document } from 'mongoose';

export interface OTPToken extends Document {
  user_id: mongoose.Types.ObjectId;
  validity_till: Date;
  value: number; // Added value field
}

const otpTokenSchema: Schema = new Schema({
  user_id: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  validity_till: { type: Date, required: true },
  value: { type: Number, required: true }, // Added value field
});

const OTPTokenModel = mongoose.model<OTPToken>('OTPToken', otpTokenSchema);

export default OTPTokenModel;
