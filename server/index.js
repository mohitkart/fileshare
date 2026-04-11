/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Store connected users
// users = { userId: [socketIds] }
const users = {};
const groups = {};
const calling = {};
const receive_call = {};

app.use(cors({
  origin: process.env.FRONTEND || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Serve a simple route
app.get("/", (req, res) => {
  res.send("Socket.IO server is running ✅");
});


app.get("/data", (req, res) => {
  res.send({ users, groups, calling, receive_call, success: true }).status(200);
});


const getSId = (userId) => {
  return users?.[userId] || []
}

// ✅ Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Temporary variable to store which user this socket belongs to
  let currentUserId = null;

  const emitTo = (userId, key, data) => {
    getSId(userId).forEach((sid) => {
      io.to(sid).emit(key, { ...data, userId: currentUserId });
    });
  }

  // Register user with a userId
  socket.on("register", (p) => {
    const userId = p.id
    currentUserId = userId;
    // Allow multiple connections per user
    if (!users[userId]) {
      users[userId] = [];
    }
    if(users[userId].includes(socket.id)) return
    users[userId].push(socket.id);
    io.emit('registered', { userId: p, socketId: socket.id })
    console.log(`${userId} registered with socket ID: ${socket.id}`);
  });


  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    // Remove disconnected socket from users list
    for (let userId in users) {
      users[userId] = users[userId].filter((sid) => sid !== socket.id);
      if (users[userId].length === 0) {
        delete users[userId];
        for (const room in groups) {
          delete groups[room]?.[userId]
        }
      }
    }
  });


  socket.on("upload_file", (data) => {
    console.log("upload_file", data)
    io.emit("files_uploaded",data)
  })

  socket.on("remove_file", (data) => {
    console.log("remove_file", data)
    io.emit("remove_file",data)
  })

});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
