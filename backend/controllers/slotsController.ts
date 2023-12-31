import { Request, Response } from 'express';
import UserSlotsModel from '../models/userSlotsModel';

const validateTimeDifference = (start: number, end: number): boolean => {
  const diffInMinutes = (end - start) / (60 * 1000);
  return diffInMinutes === 30 || diffInMinutes === 60;
};

const validateFutureTime = (timestamp: number): boolean => {
  const currentTime = Date.now();
  return timestamp > currentTime;
};

const isSlotAvailable = async (user_id: string, start: number, end: number): Promise<boolean> => {
    const existingSlot = await UserSlotsModel.findOne({
      user_id,
      status: 'ACTIVE',
      $or: [
        { scheduled_start_datetime: { $gte: new Date(start), $lt: new Date(end) } },
        { scheduled_end_datetime: { $gt: new Date(start), $lte: new Date(end) } },
      ],
    });
  
    return !existingSlot;
  };
  

const createSlot = async (user_id: string, scheduled_start_datetime: number, scheduled_end_datetime: number, message: string | null): Promise<void> => {
    const newSlot = new UserSlotsModel({
      user_id,
      scheduled_start_datetime: new Date(scheduled_start_datetime),
      scheduled_end_datetime: new Date(scheduled_end_datetime),
      status: 'ACTIVE',
      message,
    });
  
    await newSlot.save();
};
  

const validateSlot = async (user_id: string, scheduled_start_datetime: number, scheduled_end_datetime: number): Promise<boolean> => {
  if (!validateTimeDifference(scheduled_start_datetime, scheduled_end_datetime)) {
    return false;
  }

  if (!validateFutureTime(scheduled_start_datetime)) {
    return false;
  }

  if (!(await isSlotAvailable(user_id, scheduled_start_datetime, scheduled_end_datetime))) {
    return false;
  }

  return true;
};

const slotsController = {
  createSlot: async (req: Request, res: Response) => {
    const { user_id, scheduled_start_datetime, scheduled_end_datetime, message } = req.body;

    try {
      const isValid = await validateSlot(user_id, scheduled_start_datetime, scheduled_end_datetime);

      if (!isValid) {
        res.status(400).json({ message: 'Invalid slot data.' });
        return;
      }

      await createSlot(user_id, scheduled_start_datetime, scheduled_end_datetime, message);

      res.json({ message: 'Slot created successfully.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error creating slot.' });
    }
  },

  getSlots: async (req: Request, res: Response) => {
    const { start_datetime, end_datetime } = req.query;
  
    if (!start_datetime || !end_datetime) {
      res.status(400).json({ message: 'Missing required parameters.' });
      return;
    }
  
    const startTime = parseInt(start_datetime as string, 10);
    const endTime = parseInt(end_datetime as string, 10);
  
    if (isNaN(startTime) || isNaN(endTime)) {
      res.status(400).json({ message: 'Invalid timestamp format.' });
      return;
    }
  
    try {
      const slots = await UserSlotsModel.find({
        status: 'ACTIVE',
        $or: [
          { scheduled_start_datetime: { $gte: new Date(startTime), $lt: new Date(endTime) } },
          { scheduled_end_datetime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        ],
      }, {
        _id: 1,
        user_id: 1, 
        scheduled_start_datetime: 1,
        scheduled_end_datetime: 1,
        message:1,
      });
    
      const formattedSlots = slots.map(slot => ({
        slot_id: slot._id,
        user_id: slot.user_id, 
        scheduled_start_datetime: slot.scheduled_start_datetime.getTime(),
        scheduled_end_datetime: slot.scheduled_end_datetime.getTime(),
        message: slot.message,
      }));
    
      res.json(formattedSlots);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error fetching slots.' });
    }
    
  },

  
};
export default slotsController;
