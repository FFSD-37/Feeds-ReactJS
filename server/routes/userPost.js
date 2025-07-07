import express from 'express';
import {
    handleGetpost,
    handleLikePost,
    handlePostDelete,
    handlePostupload,
    handleSavePost,
    suggestedPost,
    suggestedReels
} from '../controllers/userPost.js';
import { isAuthuser } from '../middleware/isAuthuser.js';

const router=express.Router();

router.post('/', isAuthuser,handlePostupload);
router.get('/:id',handleGetpost);
router.delete('/:id', isAuthuser,handlePostDelete);
router.get('/suggestedPost/get',suggestedPost);
router.get('/suggested/reels',suggestedReels);
router.post('/liked/:id', isAuthuser,handleLikePost);
router.post('/saved/:id', isAuthuser,handleSavePost);

export default router;