import express from 'express';
const router = express.Router();

import slotsController from '../controllers/slotsController';

router.post('/', slotsController.createSlot);
router.get('/', slotsController.getSlots);

export default router;