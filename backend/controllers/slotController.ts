import { Request, Response } from 'express';
import UserSlotsModel from '../models/userSlotsModel';

const slotController = {

  updateSlot: async (req: Request, res: Response) => {
    const { slot_id, action } = req.body;

    console.log(slot_id, action);

    if (action !== 'INVALIDATE') {
      res.status(400).json({ message: 'Invalid action.' });
      return;
    }

    try {
      const slot = await UserSlotsModel.findByIdAndUpdate(
        slot_id,
        { $set: { status: 'INACTIVE' } },
        { new: true }
      );

      if (!slot) {
        res.status(404).json({ message: 'Slot not found.' });
        return;
      }

      res.json({ message: 'Slot invalidated successfully.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error invalidating slot.' });
    }
  },
};

export default slotController;
