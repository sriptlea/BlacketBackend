import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { MarketOpenPackDto, NotFound, Forbidden, openPack, MarketConvertDiamondsDto } from "@blacket/types";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { SocketService } from "src/socket/socket.service";
import { ChatService } from "src/chat/chat.service";
import { DataKey, DataService } from "src/data/data.service";
import { Blook, BlookObtainMethod } from "@blacket/core";

@Injectable()
export class MarketService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
        private readonly socketService: SocketService,
        private readonly chatService: ChatService,
        private readonly dataService: DataService
    ) { }

    // as opening packs is one of the MOST intensive operations we do
    // i'll be probably optimising this a few times and doing performance measures
    async openPack(userId: string, dto: MarketOpenPackDto) {
        const pack = await this.redisService.getPack(dto.packId);
        if (!pack) throw new NotFoundException(NotFound.UNKNOWN_PACK);
        if (!pack.enabled) throw new NotFoundException(NotFound.UNKNOWN_PACK);

        const user = await this.prismaService.user.findUnique({ select: { tokens: true }, where: { id: userId } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);
        if (user.tokens < pack.price) throw new ForbiddenException(Forbidden.PACKS_NOT_ENOUGH_TOKENS);

        const packBlooks = await this.dataService.getBlooksFromPack(dto.packId);
        const rarities = await this.redisService.getAllFromKey(DataKey.RARITY);

        // TODO: include booster chance
        const blooks = await openPack(packBlooks, rarities, 1, 100000, 1)
            .catch((err) => {
                if (err.message === NotFound.UNKNOWN_PACK) throw new NotFoundException(NotFound.UNKNOWN_PACK);
            });
        if (!blooks) throw new NotFoundException(NotFound.UNKNOWN_PACK);

        // increment user's pack opened amount, and experience. insert blook to table. decrement user tokens
        return await this.prismaService.$transaction(async (tx) => {
            await tx.user.update({ select: null, where: { id: userId }, data: { tokens: { decrement: pack.price } } });
            await tx.userStatistic.update({ select: null, where: { id: userId }, data: { packsOpened: { increment: 1 } } });

            const blookId = blooks[0].blookId;
            const shiny = blooks[0].shiny > 0;

            // const currentCount = await tx.userBlook.count({ where: { blookId, shiny } });
            // TODO: figure out a way to make this faster
            const currentCount = await tx.userBlook.findFirst({ where: { blookId, shiny }, orderBy: { serial: "desc" }, select: { serial: true } })
                .then((res) => res?.serial ?? 0);
            const nextSerial = currentCount + 1;

            const blook = packBlooks.find((blook) => blook.id === blookId);
            if (blook?.videoId) {
                this.spamChatOnInsanePull(userId, blook);
                this.socketService.emitInsanePullEvent({
                    userId,
                    videoId: blook.videoId
                });
            }

            return await tx.userBlook.create({ select: null, data: { userId, initialObtainerId: userId, blookId, shiny, obtainedBy: BlookObtainMethod.PACK_OPEN, serial: nextSerial } });
        });
    }

    async convertDiamonds(userId: string, dto: MarketConvertDiamondsDto) {
        return await this.prismaService.$transaction(async (tx) => {
            const user = await this.prismaService.user.findUnique({ where: { id: userId }, select: { diamonds: true } });
            if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

            if (user.diamonds < dto.amount) throw new ForbiddenException(Forbidden.DEFAULT_NOT_ENOUGH_DIAMONDS);

            await tx.user.update({ where: { id: userId }, data: { diamonds: { decrement: dto.amount } } });
            await tx.user.update({ where: { id: userId }, data: { tokens: { increment: dto.amount * 3 } } });
        });
    }

    private async spamChatOnInsanePull(userId: string, blook: Blook) {
        this.chatService.createMessage(userId, 0, {
            content: `I JUST PULLED A ${blook.name.toUpperCase()}!!!\n`.repeat(50),
            nonce: crypto.randomUUID()
        });
    }
}
