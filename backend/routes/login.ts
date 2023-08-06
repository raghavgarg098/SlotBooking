import express from 'express';
const router = express.Router();

import loginController from '../controllers/loginController';

router.post('/', loginController.login);

export default router;
