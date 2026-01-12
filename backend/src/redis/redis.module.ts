import { Global, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { CoreModule } from "src/core/core.module";

@Global()
@Module({
    imports: [CoreModule],
    providers: [RedisService],
    exports: [RedisService]
})
export class RedisModule { }
