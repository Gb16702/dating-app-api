import SocketService from "../app/Services/SocketService";

SocketService.boot();

SocketService.io.on("connection", (socket) => {
  console.log("a user connected");
  socket.emit("news", { hello: "world" });

  socket.on("event", (data) => {
    console.log(data, "OK");
  });
});
