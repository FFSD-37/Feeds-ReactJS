import express from "express";
import router from "./routes/user.js";
import dotenv from "dotenv";
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
import Channel from "./models/channelSchema.js";
import cors from "cors";
import { clearSession, setSession } from "./controllers/timout.js";
import { errorhandler } from "./middleware/handlerError.js";
import { Logger } from "./middleware/applicationMiddleware.js"
// import { fakeRoute } from "./controllers/userPost.js";

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

// Application level middleware
app.use(Logger);

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
    const token = parsedCookie.uuid || parsedCookie.cuid;
    if (!token) {
      console.log("⚠️ No uuid token in cookies");
      return next(new Error("Missing auth token"));
    }

    const { data } = verify_JWTtoken(
      token,
      process.env.USER_SECRET
    );
    socket.userId = data[0];
    socket.userType = data[3];
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
    if (socket.userType === "Channel") {
      await Channel.findOneAndUpdate(
        { channelName: socket.userId },
        { socketId: socket.id }
      );
    } else {
      await User.findOneAndUpdate(
        { username: socket.userId },
        { socketId: socket.id }
      );
    }
    setSession(socket.userId);
  } catch (err) {
    console.log("❌ User socket update error:", err);
  }

  socket.on("sendMessage", async (data) => {
    try {
      const { to, text, dateTime, toType = "Normal" } = data;
      const fromType = socket.userType === "Channel" ? "Channel" : socket.userType || "Normal";
      const normalizedToType = toType === "Channel" ? "Channel" : toType === "Kids" ? "Kids" : "Normal";
      if (fromType === "Kids" || normalizedToType === "Kids") return;

      await Chat.create({
        from: socket.userId,
        fromType,
        to,
        toType: normalizedToType,
        text,
        createdAt: dateTime,
      });

      let receiver = null;
      if (normalizedToType === "Channel") {
        receiver = await Channel.findOne({ channelName: to }).select("socketId");
      } else {
        receiver = await User.findOne({ username: to }).select("socketId");
      }

      if (receiver?.socketId) {
        socket.to(receiver.socketId).emit("receiveMessage", {
          from: socket.userId,
          fromType,
          to,
          toType: normalizedToType,
          text,
          dateTime,
        });
      }
      socket.emit("receiveMessage", {
        from: socket.userId,
        fromType,
        to,
        toType: normalizedToType,
        text,
        dateTime,
      });
    } catch (err) {
      console.log("❌ Chat send error:", err);
    }
  });

  socket.on("deleteChat", async (data) => {
    try {
      const { withUser, withType = "Normal" } = data || {};
      if (!withUser) return;

      const meType =
        socket.userType === "Channel" ? "Channel" : socket.userType || "Normal";
      const targetType =
        withType === "Channel" ? "Channel" : withType === "Kids" ? "Kids" : "Normal";
      if (meType === "Kids" || targetType === "Kids") return;

      await Chat.deleteMany({
        $or: [
          {
            from: socket.userId,
            fromType: meType,
            to: withUser,
            toType: targetType,
          },
          {
            from: withUser,
            fromType: targetType,
            to: socket.userId,
            toType: meType,
          },
        ],
      });

      let target = null;
      if (targetType === "Channel") {
        target = await Channel.findOne({ channelName: withUser }).select("socketId");
      } else {
        target = await User.findOne({ username: withUser }).select("socketId");
      }

      socket.emit("chatDeleted", { withUser, withType: targetType });
      if (target?.socketId) {
        socket.to(target.socketId).emit("chatDeleted", {
          withUser: socket.userId,
          withType: meType,
        });
      }
    } catch (err) {
      console.log("❌ Chat delete error:", err);
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
