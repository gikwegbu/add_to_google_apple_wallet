import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { AppleService } from './apple.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('apple')
export class AppleController {
    constructor(
        private readonly appleService: AppleService,
        private readonly prisma: PrismaService,
    ) {}

    @Get('pass/:userId')
    async downloadPass(@Param('userId') userId: string, @Res() res: Response) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            const activeConfig = await this.prisma.ticketConfig.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
            });

            const ticketConfig = {
                eventName: activeConfig?.eventName || 'Demo Event',
                imageUrl: activeConfig?.imageUrl || 'https://newreistyfilestorage.blob.core.windows.net/restaurantlogo/ecb73eed-9f05-40a1-83a3-f674fe0b3d55IMG_0171.jpg',
                logoUrl: activeConfig?.logoUrl || 'https://newreistyfilestorage.blob.core.windows.net/restaurantlogo/ecb73eed-9f05-40a1-83a3-f674fe0b3d55IMG_0171.jpg',
                fullname: user.fullname,
            };

            const buffer = await this.appleService.generatePassBuffer(user, ticketConfig);

            // Sanitize username for filename: e.g. "George_ikwegbu_pass.pkpass"
            const prefix = (user.fullname || user.email?.split('@')[0] || 'user')
                .trim()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_-]/g, '');
            const filename = `${prefix}_pass.pkpass`;

            res.set({
                'Content-Type': 'application/vnd.apple.pkpass',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            });

            return res.send(buffer);
        } catch (error) {
            console.error('❌ Error in downloadPass:', error);
            return res.status(500).json({
                statusCode: 500,
                message: error.message || 'Pass generation failed',
            });
        }
    }
}
