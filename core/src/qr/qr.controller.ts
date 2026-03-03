import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
    constructor(private readonly qrService: QrService) { }

    @Get('generate/:userId')
    generate(@Param('userId') userId: string) {
        const token = this.qrService.generateToken(userId);
        return { token };
    }

    @Post('scan')
    scan(@Body('token') token: string) {
        const userId = this.qrService.validateToken(token);
        return { valid: true, userId };
    }
}
