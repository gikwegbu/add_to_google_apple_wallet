import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { GoogleService } from './google.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('google')
export class GoogleController {
    constructor(
        private readonly googleService: GoogleService,
        private readonly prisma: PrismaService,
    ) {}

    @Get('pass/:userId')
    async getPass(@Param('userId') userId: string, @Res() res: Response) {
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

        const { saveUrl } = await this.googleService.createPass(user, ticketConfig);

        return res.redirect(saveUrl);
    }

    @Get('url/:userId')
    async getPassUrl(@Param('userId') userId: string) {
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

        const { saveUrl } = await this.googleService.createPass(user, ticketConfig);
        return { saveUrl };
    }
}
