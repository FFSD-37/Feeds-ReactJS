import express from 'express';
import { handlechannelPostupload } from '../controllers/channelPost.js';

const router=express.Router();

router.post('/',handlechannelPostupload);

export default router;