import express from "express";
import router from "./routes/user.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { parseCookieString, verify_JWTtoken } from "cookie-string-parser";
import connectToMongo from "./Db/connection.js";
import notificationRouter from "./routes/notification.js";
import post from "./routes/userPost.js";
import channelPost from "./routes/channelPost.js";
import { Server } from "socket.io";
import http from "http";
import User from "./models/users_schema.js";
import Chat from "./models/chatSchema.js";
import cors from "cors";
import { clearSession, setSession } from "./controllers/timout.js";
import { errorhandler } from "./middleware/handlerError.js";
// import { fakeRoute } from "./controllers/userPost.js";
// import { applicationMiddleware } from "./middleware/applicationMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Connect MongoDB
connectToMongo();

// ✅ Middleware
app.use(cookieParser());

// ✅ Allow frontend at http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/fake", (req, res, next) => {
  try {
    throw new Error("Demo error: simulated failure for /fake route");
  } catch (error) {
    console.log("❌ Error in /fake route:", error.message);
    return next(error);
  }
});

// ✅ Routes
app.use("/", router);
app.use("/post", post);
app.use("/notification", notificationRouter);
app.use("/channel", channelPost);

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// ✅ Socket Authentication
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake?.headers?.cookie;
    if (!cookieHeader) {
      console.log("⚠️ No cookie header in socket handshake");
      return next(new Error("No cookie header present"));
    }

    const parsedCookie = parseCookieString(cookieHeader);
    if (!parsedCookie.uuid) {
      console.log("⚠️ No uuid token in cookies");
      return next(new Error("Missing auth token"));
    }

    const { data } = verify_JWTtoken(
      parsedCookie.uuid,
      process.env.USER_SECRET
    );
    socket.userId = data[0];
    socket.img = data[2];
    next();
  } catch (err) {
    console.log("❌ Socket auth error:", err);
    next(new Error("Authentication failed"));
  }
});

// ✅ Socket Events
io.on("connection", async (socket) => {
  console.log(`✅ ${socket.userId} connected`);

  try {
    await User.findOneAndUpdate(
      { username: socket.userId },
      { socketId: socket.id }
    );
    setSession(socket.userId);
  } catch (err) {
    console.log("❌ User socket update error:", err);
  }

  socket.on("sendMessage", async (data) => {
    try {
      const { to, text, dateTime } = data;
      await Chat.create({ from: socket.userId, to, text, createdAt: dateTime });

      const receiver = await User.findOne({ username: to });
      if (receiver?.socketId) {
        socket.to(receiver.socketId).emit("receiveMessage", {
          from: socket.userId,
          text,
          dateTime,
        });
      }
    } catch (err) {
      console.log("❌ Chat send error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`⚠️ ${socket.userId} disconnected`);
    clearSession(socket.userId);
  });
});

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorhandler);

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
