import SocketService from "../app/Services/SocketService";

SocketService.boot();

SocketService.io.on("connection", (socket) => {
  socket.emit("news", { hello: "world" });

  socket.on("event", () => {});
});
