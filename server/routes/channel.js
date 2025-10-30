import express from 'express';
import {create_channel} from '../controllers/Ayush/channel.js';

const router=express.Router();

router.post('/',create_channel);

export default router;