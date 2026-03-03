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

    async findUserByIdentifier(identifier: string) {
        // Try UUID first
        let user = await this.prisma.user.findUnique({ where: { id: identifier } });
        if (!user) {
            // Try Email
            user = await this.prisma.user.findUnique({ where: { email: identifier } });
        }
        return user;
    }

    async getTransactions() {
        return this.prisma.transaction.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async redeem(token: string, points: number) {
        const userId = this.qrService.validateToken(token);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.points < points) throw new BadRequestException(`Insufficient points (needed ${points})`);

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                points: { decrement: points },
                transactions: {
                    create: {
                        points: points,
                        type: 'REDEMPTION'
                    }
                }
            }
        });

        // Update passes
        await this.googleService.updatePass(updatedUser, { textModulesData: [{ header: 'Points', body: updatedUser.points.toString(), id: 'points' }] });

        return updatedUser;
    }

    async award(identifier: string, points: number) {
        const user = await this.findUserByIdentifier(identifier);
        if (!user) throw new BadRequestException('User not found');

        return this.prisma.user.update({
            where: { id: user.id },
            data: {
                points: { increment: points },
                transactions: {
                    create: {
                        points: points,
                        type: 'CREDIT'
                    }
                }
            }
        });
    }
}
