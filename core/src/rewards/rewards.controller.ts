import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) { }

    @Post('redeem')
    redeem(@Body() body: { token: string; points: number }) {
        return this.rewardsService.redeem(body.token, body.points);
    }

    @Get('transactions')
    getTransactions() {
        return this.rewardsService.getTransactions();
    }

    @Post('award')
    award(@Body() body: { userId: string; points: number }) {
        // userId here can be email or plain UUID
        return this.rewardsService.award(body.userId, body.points);
    }
}
