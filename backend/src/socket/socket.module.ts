import { Global, Module, forwardRef } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";
import { UsersService } from "src/users/users.service";
import { ChatModule } from "src/chat/chat.module";

@Global()
@Module({
    imports: [forwardRef(() => ChatModule)],
    providers: [SocketGateway, SocketService, UsersService],
    exports: [SocketGateway, SocketService]
})
export class SocketModule { }
