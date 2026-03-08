import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import connectionRoutes from "./routes/connections.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost on any port
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }

      // Allow any vercel.app domain
      if (origin.match(/.*\.vercel\.app$/)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
// Serve the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      if (origin.match(/.*\.vercel\.app$/)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"]
  }
});

// Map to track active user sockets -> Map<userId, socketId>
global.onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user logs in / connects, they send their ID
  socket.on('authenticate', (userId) => {
    socket.userId = String(userId); // Store userId on the socket instance
    global.onlineUsers.set(String(userId), socket.id);
    console.log(`User ${userId} authenticated on socket ${socket.id}`);

    // Broadcast to everyone that this user is online
    io.emit('user_status', { userId, status: 'online' });
  });

  // Handle typing events
  socket.on('typing', (receiverId) => {
    if (socket.userId && global.onlineUsers.has(String(receiverId))) {
      const receiverSocketId = global.onlineUsers.get(String(receiverId));
      io.to(receiverSocketId).emit('user_typing', { senderId: socket.userId });
    }
  });

  // WebRTC Video/Voice Call Signaling
  socket.on('call_user', (data) => {
    // data: { userToCall: receiverId, signalData: offer, from: senderId, name: callerName, type: 'video'|'audio' }
    const receiverSocketId = global.onlineUsers.get(String(data.userToCall));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming_call', {
        signal: data.signalData,
        from: data.from,
        name: data.name,
        type: data.type
      });
    }
  });

  socket.on('answer_call', (data) => {
    // data: { to: callerId, signal: answer }
    const callerSocketId = global.onlineUsers.get(String(data.to));
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_accepted', data.signal);
    }
  });

  socket.on('ice_candidate', (data) => {
    // data: { to: receiverId, candidate: RTCIceCandidate }
    const receiverSocketId = global.onlineUsers.get(String(data.to));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_ice_candidate', data.candidate);
    }
  });

  socket.on('end_call', (data) => {
    // data: { to: otherUserId }
    const receiverSocketId = global.onlineUsers.get(String(data.to));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call_ended');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find who disconnected
    let disconnectedUserId = null;
    for (const [userId, socketId] of global.onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        global.onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      io.emit('user_status', { userId: disconnectedUserId, status: 'offline' });
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Flatmate API running 🚀",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      profiles: "/api/profiles",
      connections: "/api/connections",
      messages: "/api/messages",
      notifications: "/api/notifications",
      users: "/api/users"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Please check:");
    console.error("1. MySQL is running");
    console.error("2. Database 'flatmate_db' exists");
    console.error("3. Credentials in .env are correct");
  }
};

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testDatabaseConnection();
});