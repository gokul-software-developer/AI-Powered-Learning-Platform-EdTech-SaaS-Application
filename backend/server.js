require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sessionMiddleware, initSessionStore } = require('./config/session');
const routes = require('./routes/index.routes');
const sequelize = require('./config/postgres');
const todoRoutes = require('./routes/todolist.routes');
const studyPlanRoutes = require('./routes/studyPlan.routes');
const studyProgressRoutes = require('./routes/studyProgress');
const path = require('path');



// --- 🚦 Sanity check for env ---
if (!process.env.DB_NAME || !process.env.DB_PASSWORD) {
  console.error('Missing essential environment variables. Check .env file.');
  process.exit(1);
}

// --- Express app setup ---
const app = express();
app.use('/certificates', express.static('public/certificates'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
initSessionStore();

// --- RESTful API routes ---
app.use('/api', routes);
app.use('/api/todos', todoRoutes);
app.use('/api/study-plan', studyPlanRoutes);
app.use('/api/progress', studyProgressRoutes);

// Example: get username (make sure client is imported properly)
app.get('/user/:id', async (req, res) => {
  // ... your SQL logic ...
});

// Health check routes
app.get('/', (req, res) => res.send('Backend is running!'));
app.get('/api', (req, res) => res.json({ message: 'API is working!' }));
   // ✅ This is what was missing

// 404 Handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Express error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Database connection (Sequelize) ---
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));
require('./utils/cleanup');

// --- Create HTTP server so we can attach Socket.IO ---
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});
app.set('io', io); // Make io accessible in routes/controllers

// --- SOCKET.IO LOGIC (basic chat) ---
function isValidPdfLink(message) {
  if (typeof message !== 'string') return false;

  try {
    const url = new URL(message);
    return url.pathname.toLowerCase().endsWith('.pdf');
  } catch (_) {
    const trimmed = message.trim();
    return trimmed.toLowerCase().endsWith('.pdf') && trimmed.includes('/');
  }
}
const { GroupMessage, User } = require("./models");

io.on("connection", (socket) => {
  // Personal room join
  socket.on("register", ({ userId }) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined user_${userId}`);
    }
  });

  // Join group chat room
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`Socket ${socket.id} joined group_${groupId}`);
  });

  // Receive group chat messages
  socket.on("groupMessage", async ({ userId, groupId, message, isPdfLink }) => {
    try {
      console.log('Received group message:', { groupId, userId, message, isPdfLink });

    // Your PDF detection logic: 
    const pdfFlag = typeof isPdfLink === 'boolean' ? isPdfLink : false;
    console.log('Is detected as PDF:', pdfFlag);
      const groupMsg = await GroupMessage.create({
        group_id: groupId,
        sender_id: userId,
        message_text: message,
        isPdfLink: !!isPdfLink,
      });
      const sender = await User.findByPk(userId, {
        attributes: ["id", "first_name", "last_name"],
      });

      io.to(`group_${groupId}`).emit("newMessage", {
        id: groupMsg.id,
        message_text: groupMsg.message_text,
        sender: sender,
        createdAt: groupMsg.createdAt,
        isPdfLink: pdfFlag,
      });
    } catch (error) {
      console.error("Error handling groupMessage:", error);
    }
  });

 

    socket.on("joinProfile", (userId) => {
    socket.join(`profile_${userId}`);
  });
  // Listen for profile interaction events (follow, unfollow, request)
  socket.on("profileEvent", async ({ toUserId, type, fromUser }) => {
    // Optionally, record these events or update DB here if needed

    // Broadcast to the affected user's room only so they get real-time updates
    io.to(`profile_${toUserId}`).emit("profileChanged", { type, fromUser });
  });
   socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

 

// --- Boot the server (HTTP+Sockets) ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: false }); // Use force:true only in development to reset DB
    console.log('✅ Database synced');
    const PORT = process.env.PORT || 4000;
    http.listen(PORT, () => {
      console.log(`🚀 Listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();
