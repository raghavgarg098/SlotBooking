import express from 'express';
const router = express.Router();

import slotController from '../controllers/slotController';

router.patch('/', slotController.updateSlot);

export default router;