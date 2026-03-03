import { Controller, Post, Body, Get } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post('config')
    createConfig(@Body() data: any) {
        return this.ticketsService.createConfig(data);
    }

    @Get('config')
    getActiveConfig() {
        return this.ticketsService.getActiveConfig();
    }
}
