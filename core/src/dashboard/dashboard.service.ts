import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getRecentActivity() {
        // Fetch 5 latest users
        const recentUsers = await this.prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                fullname: true,
                createdAt: true
            }
        });

        // Fetch 5 latest transactions
        const recentTransactions = await this.prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true,
                        fullname: true
                    }
                }
            }
        });

        // Combine and format
        const activity = [
            ...recentUsers.map(u => ({
                id: `user-${u.id}`,
                type: 'User Joined',
                user: u.fullname || u.email,
                time: u.createdAt,
                status: 'success'
            })),
            ...recentTransactions.map(t => ({
                id: `txn-${t.id}`,
                type: t.type === 'CREDIT' ? 'Points Credited' : 'Points Redeemed',
                user: t.user.fullname || t.user.email,
                points: t.points,
                time: t.createdAt,
                status: t.type === 'CREDIT' ? 'info' : 'warning'
            }))
        ];

        // Sort combined activity by time desc
        return activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    }
}
