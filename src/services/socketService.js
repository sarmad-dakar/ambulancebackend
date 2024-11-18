var socketToConversation = {};
const emergencySocketService = (socket, io) => {
  console.log(`User connected with socket ID: ${socket.id}`);

  // Handle user joining a room by conversation ID
  socket.on("joinRoom", (conversationId) => {
    socket.join(String(conversationId));
    socketToConversation[socket.id] = conversationId;
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  // Handle sending messages to the room with the same conversation ID
  socket.on("sendMessage", (message) => {
    const conversationId = socketToConversation[socket.id];
    if (conversationId) {
      io.to(String(conversationId)).emit("message", message);
      console.log(`Message sent to room ${conversationId}: ${message}`);
    } else {
      console.log(`User ${socket.id} is not in a room.`);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(socketToConversation);
    const conversationId = socketToConversation[socket.id];
    if (conversationId) {
      socket.leave(conversationId);
      delete socketToConversation[socket.id];
      console.log(`User ${socket.id} left room ${conversationId}`);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
};

module.exports = emergencySocketService;
