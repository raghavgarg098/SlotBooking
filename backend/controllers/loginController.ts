import { Request, Response } from 'express';
import UserModel, { User } from '../models/userModel';
import OTPTokenModel from '../models/otpTokenModel';
import sendEmail from '../helpers/emailHelper';

const generateOTP = (): number => {
  return Math.floor(1000 + Math.random() * 9000);
};

const createUserIfNeeded = async (email: string): Promise<User> => {
  let user = await UserModel.findOne({ email });

  if (!user) {
    user = new UserModel({ email });
    await user.save();
  }

  return user;
};

const createOTPToken = async (user: User, otp: number): Promise<void> => {
  const validityTill = new Date();
  validityTill.setMinutes(validityTill.getMinutes() + 1);

  const otpToken = new OTPTokenModel({
    user_id: user._id,
    validity_till: validityTill,
    value: otp,
  });

  await otpToken.save();
};

const loginController = {
  login: async (req: Request, res: Response) => {
    const { email, action } = req.body;

    try {
      const otp = generateOTP();
      const user = await createUserIfNeeded(email);
      await createOTPToken(user, otp);

      await sendEmail(email, 'OTP for Login', `Your OTP is: ${otp}`);

      console.log('OTP email sent');
      res.json({ message: 'Login successful. OTP sent to your email.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error processing login.' });
    }
  },
};

export default loginController;
