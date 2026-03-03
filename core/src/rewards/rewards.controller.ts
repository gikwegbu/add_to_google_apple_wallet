import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) { }

    @Post('redeem')
    redeem(@Body('token') token: string) {
        return this.rewardsService.redeem(token);
    }

    @Post('award')
    award(@Body() body: { userId: string; points: number }) {
        return this.rewardsService.award(body.userId, body.points);
    }
}
