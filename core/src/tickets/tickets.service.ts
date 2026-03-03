import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async createConfig(data: any) {
        // Deactivate previous configs if needed
        // await this.prisma.ticketConfig.updateMany({ data: { isActive: false } });

        // Destructure to avoid unique constraint errors if re-saving existing config
        const { id, createdAt, updatedAt, ...configData } = data;

        return this.prisma.ticketConfig.create({
            data: {
                ...configData,
                totalQuantity: parseInt(configData.totalQuantity) || 0,
                expirationDate: new Date(configData.expirationDate),
                eventDate: new Date(configData.eventDate),
                metadata: configData.metadata || {},
            },
        });
    }

    async getActiveConfig() {
        return this.prisma.ticketConfig.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
