import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { ApiTags } from "@nestjs/swagger";
import { GetCurrentUser } from "src/core/decorator";
import { FriendsFriendsEntity } from "@blacket/types";

@ApiTags("friends")
@Controller("friends")
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Get("/")
    async getFriends(@GetCurrentUser() userId: string) {
        const friends = await this.friendsService.getFriends(userId);

        return new FriendsFriendsEntity(friends);
    }

    @Post(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    addFriend(@GetCurrentUser() userId: string, @Param("id") id: string) {
        try {
            return this.friendsService.addFriend(userId, id);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    removeFriend(@GetCurrentUser() userId: string, @Param("id") id: string) {
        try {
            return this.friendsService.removeFriend(userId, id);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    @Post(":id/block")
    @HttpCode(HttpStatus.NO_CONTENT)
    blockUser(@GetCurrentUser() userId: string, @Param("id") id: string) {
        try {
            return this.friendsService.blockUser(userId, id);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    @Post(":id/unblock")
    unblockUser(@GetCurrentUser() userId: string, @Param("id") id: string) {
        try {
            return this.friendsService.unblockUser(userId, id);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    @Post(":id/revoke")
    @HttpCode(HttpStatus.NO_CONTENT)
    revokeRequest(@GetCurrentUser() userId: string, @Param("id") id: string) {
        try {
            return this.friendsService.revokeRequest(userId, id);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    @Post(":id/decline")
    @HttpCode(HttpStatus.NO_CONTENT)
    declineRequest(@GetCurrentUser() userId: string, @Param("id") id: string) {
        try {
            return this.friendsService.declineRequest(userId, id);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
