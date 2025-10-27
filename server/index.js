import express from 'express';
import router from './routes/user.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { cookieParser, parseCookieString, verify_JWTtoken } from 'cookie-string-parser';
import connectToMongo from './Db/connection.js';
import channelRouter from './routes/channel.js';
import notificationRouter from './routes/notification.js';
import post from './routes/userPost.js';
import channelPost from './routes/channelPost.js';
import { Server } from 'socket.io';
import http from 'http';
import User from './models/users_schema.js';
import Chat from './models/chatSchema.js';
import cors from 'cors';
import { clearSession, setSession } from './controllers/timout.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// MongoDB Connection
connectToMongo();

// Middleware
app.use(cookieParser);
app.use(cors({
  origin: 'http://localhost:3000', // React frontend URL
  credentials: true,
  methods: ['GET', 'POST']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', router);
app.use('/post', post);
app.use('/channel', channelRouter);
app.use('/notification', notificationRouter);
app.use('/channel', channelPost);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

io.use((socket, next) => {
  const cookie = socket.handshake.headers.cookie;
  const parsedCookie = parseCookieString(cookie);
  const { data } = verify_JWTtoken(parsedCookie.uuid, process.env.USER_SECRET);
  socket.userId = data[0];
  socket.img = data[2];
  next();
});

io.on('connection', async (socket) => {
  console.log(socket.userId + ' user connected');
  await User.findOneAndUpdate({ username: socket.userId }, { socketId: socket.id });
  setSession(socket.userId);

  socket.on('sendMessage', async (data) => {
    try {
      const { to, text, time } = data;
      await Chat.create({ from: socket.userId, to, text, createdAt: time });
      const { socketId } = await User.findOne({ username: to });
      socket.to(socketId).emit('receiveMessage', { from: socket.userId, text, time });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    clearSession(socket.userId);
  });
});

// Start Backend Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});