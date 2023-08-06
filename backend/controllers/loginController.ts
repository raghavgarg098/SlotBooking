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

const sendOTPByEmail = async (email: string, otp: number): Promise<void> => {
  await sendEmail(email, 'OTP for Login', `Your OTP is: ${otp}`);
};

const handleGetOTP = async (email: string, res: Response) => {
  try {
    const otp = generateOTP();
    const user = await createUserIfNeeded(email);
    await createOTPToken(user, otp);

    await sendOTPByEmail(email, otp);

    console.log('OTP email sent');
    res.json({ message: ' OTP sent to your email.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing login.' });
  }
};

const handleValidateOTP = async (email: string, otp: number, res: Response) => {
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'User not found.' });
      return;
    }

    const recentOTPToken = await OTPTokenModel.findOne({ user_id: user._id }, {}, { sort: { validity_till: -1 } });

    if (!recentOTPToken || recentOTPToken.validity_till < new Date() || recentOTPToken.value !== otp) {
      res.status(400).json({ message: 'Incorrect OTP or expired validity.' });
      return;
    }

    // Delete all OTP tokens for the user
    await OTPTokenModel.deleteMany({ user_id: user._id });

    res.json({ message: 'OTP validation successful.', user_id: user._id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing login.' });
  }
};

const loginController = {
  login: async (req: Request, res: Response) => {
    const { email, otp, action } = req.body;

    if (action === 'GET_OTP') {
      await handleGetOTP(email, res);
    } else if (action === 'VALIDATE_OTP') {
      await handleValidateOTP(email, otp, res);
    } else {
      res.status(400).json({ message: 'Invalid action.' });
    }
  },
};

export default loginController;
