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
            // Fallback: If it's a valid UUID, treat it as a plain User ID (for legacy passes)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(token)) {
                return token;
            }
            throw new UnauthorizedException('Invalid QR Token');
        }
    }
}
