const express = require('express');
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle sending location to all clients
    socket.on("send-location", (data) => {
        const { latitude, longitude } = data;
        const id = socket.id; // Unique identifier for each client

        // Broadcast the location to all connected clients including the sender
        io.emit("receive-location", { id, latitude, longitude });
    });

    // Handle disconnecting user
    socket.on("disconnect", () => {
        console.log("User disconnected");
        const id = socket.id;

        // Notify all clients that this user has disconnected
        io.emit("user-disconnected", id);
    });
});

app.get("/", function (req, res) {
    res.render("index");
});

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
