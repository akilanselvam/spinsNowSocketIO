const PORT = process.env.PORT || 8800; // Use the port provided by the environment or default to 8800

const io = require("socket.io")(PORT, {
  cors: {
    origin: ["http://localhost:3000", "https://spinsnowapp.web.app/"]
  }
});

let activeUsers = [];

io.on("connection", socket => {
  socket.on("new-user-add", newUserId => {
    if (!activeUsers.some(user => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", data => {
    const { receiverId } = data;
    const user = activeUsers.find(user => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    console.log("Data: ", data);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    } else {
      console.log("Receiver not connected");
    }
  });
});
