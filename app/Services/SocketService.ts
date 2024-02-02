import { Server } from "socket.io";
import AdonisServer from "@ioc:Adonis/Core/Server";

class SocketService {
    public io: Server;
    private booted: boolean = false;

    public boot() {
        if (this.booted) {
            return;
        }

        this.booted = true;
        this.io = new Server(AdonisServer.instance!, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        })
    }
}

export default new SocketService();