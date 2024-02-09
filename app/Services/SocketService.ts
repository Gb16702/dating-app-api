import { Server } from "socket.io";
import AdonisServer from "@ioc:Adonis/Core/Server";

class SocketService {
    public io: Server;
    private booted: boolean = false;
    private userInSockets = new Map<string, string>();

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

        this.setupListeners();
    }

    private setupListeners() {
        this.io.on("connection", (socket) => {
            const userId = socket.handshake.auth.id;

            if (userId) {
                this.userInSockets.set(userId, socket.id);
            }

            socket.on("disconnect", () => {
                this.userInSockets.delete(userId);
            });
        });
    }

    public emitToUser(userId: string, eventName: string, data: any) {
        const socketId = this.userInSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(eventName, data);
        }
    }
}

export default new SocketService();