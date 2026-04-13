const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); 
app.use('/api/user', userRoutes); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow the frontend to connect
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('🟢 A traveler connected to the socket');

    socket.on('sendMessage', (data) => {
        io.emit('receiveMessage', data); 
    });

    socket.on('disconnect', () => {
        console.log('🔴 A traveler disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('Solo Travel API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});