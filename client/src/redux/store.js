import { configureStore } from '@reduxjs/toolkit';
import socketReduce from './slices/socketSlice.js';

export const store = configureStore({
  reducer: {
    socket: socketReduce,
  },
});
