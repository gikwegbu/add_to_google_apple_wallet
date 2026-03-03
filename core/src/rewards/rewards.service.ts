import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import { GoogleService } from '../google/google.service';

@Injectable()
export class RewardsService {
    constructor(
        private prisma: PrismaService,
        private qrService: QrService,
        private googleService: GoogleService,
    ) { }

    async redeem(token: string) {
        const userId = this.qrService.validateToken(token);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.points < 10) throw new BadRequestException('Insufficient points');

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                points: { decrement: 10 },
                redemptions: {
                    create: { points: 10 }
                }
            }
        });

        // Update passes
        await this.googleService.updatePass(updatedUser, { textModulesData: [{ header: 'Points', body: updatedUser.points.toString(), id: 'points' }] });

        return updatedUser;
    }

    async award(userId: string, points: number) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { points: { increment: points } }
        });
    }
}
