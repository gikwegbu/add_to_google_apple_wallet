import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleService } from '../google/google.service';
import { AppleService } from '../apple/apple.service';

// For any new user data added, 

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private googleService: GoogleService,
        private appleService: AppleService,
    ) { }

    async register(email: string, fullname: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
        user = await this.prisma.user.create({
            data: { email, points: 100, fullname },
        });
        isNewUser = true;
    }

    const ticketConfig = {
        eventName: 'Demo Event',
        imageUrl: 'https://newreistyfilestorage.blob.core.windows.net/restaurantlogo/ecb73eed-9f05-40a1-83a3-f674fe0b3d55IMG_0171.jpg',
        logoUrl: 'https://newreistyfilestorage.blob.core.windows.net/restaurantlogo/ecb73eed-9f05-40a1-83a3-f674fe0b3d55IMG_0171.jpg',
        fullname : user.fullname,
    };

    // Only create passes for new users
    if (isNewUser) {
        const googlePass = await this.googleService.createPass(user, ticketConfig);
        const applePass = await this.appleService.createPass(user, ticketConfig);

        // Save pass IDs to user record
        user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                googlePassId: googlePass.objectId,
                applePassId: applePass.authenticationToken,
            },
        });

        return {
            user,
            googlePassUrl: googlePass.saveUrl,
            applePassToken: applePass.authenticationToken,
        };
    }

    // Existing user — return their existing pass IDs
    return {
        user,
        googlePassUrl: user.googlePassId ? `https://pay.google.com/gp/v/save/${user.googlePassId}` : null,
        applePassToken: user.applePassId || null,
    };
}

    async findAll() {
        return this.prisma.user.findMany();
    }

    async remove(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}
