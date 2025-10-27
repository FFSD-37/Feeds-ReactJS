import express from 'express';
import {createNotification} from '../controllers/notification.js';

const router=express.Router();

router.post('/',createNotification);

export default router;