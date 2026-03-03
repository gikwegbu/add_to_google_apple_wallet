import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrService {
    private secret: string;

    constructor(private configService: ConfigService) {
        this.secret = this.configService.get('ADMIN_JWT_SECRET') || 'secret';
    }

    generateToken(userId: string) {
        return jwt.sign({ sub: userId }, this.secret, { expiresIn: '1h' });
    }

    validateToken(token: string) {
        try {
            const decoded = jwt.verify(token, this.secret) as any;
            return decoded.sub;
        } catch (e) {
            throw new UnauthorizedException('Invalid QR Token');
        }
    }
}
