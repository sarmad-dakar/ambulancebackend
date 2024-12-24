var socketToConversation = {};
const emergencySocketService = (socket, io) => {
  console.log(`User connected with socket ID: ${socket.id}`);

  socket.on("joinRoom", (conversationId) => {
    // Check if the user is already in a room
    const previousRoom = socketToConversation[socket.id];
    if (previousRoom) {
      // Remove user from the previous room
      socket.leave(String(previousRoom));
      console.log(`User ${socket.id} left previous room ${previousRoom}`);
    }

    // Join the new room
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
