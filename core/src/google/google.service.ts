import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { GoogleAuth } from 'google-auth-library';
import { QrService } from '../qr/qr.service';

@Injectable()
export class GoogleService implements OnModuleInit {
    private issuerId: string;
    private classId: string;
    private serviceAccountEmail: string;
    private privateKey: string;
    private credentialsPath: string;
    private auth: GoogleAuth;

    constructor(
        private configService: ConfigService,
        private qrService: QrService,
    ) {
        this.issuerId = this.configService.get<string>('google.issuerId') || '';
        this.classId = this.configService.get<string>('google.classId') || '';
        this.serviceAccountEmail = this.configService.get<string>('google.serviceAccountEmail') || '';
        this.privateKey = this.configService.get<string>('google.privateKey')?.replace(/\\n/g, '\n') || '';
        this.credentialsPath = this.configService.get<string>('google.credentialsPath') || '';

        this.auth = new GoogleAuth({
            keyFile: this.credentialsPath,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });
    }

    async onModuleInit() {
        await this.createGenericClass();
    }

    async createGenericClass() {
        const client = await this.auth.getClient();
        const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

        try {
            await client.request({ url: `${baseUrl}/genericClass/${this.classId}`, method: 'GET' });
            console.log('✅ Generic class already exists:', this.classId);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                console.log('🔧 Generic class not found, creating...');
                await client.request({
                    url: `${baseUrl}/genericClass`,
                    method: 'POST',
                    data: {
                        id: this.classId,
                        issuerName: 'Your Company',
                    },
                });
                console.log('✅ Generic class created:', this.classId);
            } else {
                console.error('❌ Error checking generic class:', error?.response?.data || error);
                throw error;
            }
        }
    }

    async createPass(user: any, ticketConfig: any) {
        const objectId = `${this.issuerId}.${user.id}`;
        const cred = require(this.credentialsPath);

        const passObject = {
            id: objectId,
            classId: this.classId,
            state: 'ACTIVE',
            logo: {
                sourceUri: { uri: ticketConfig.logoUrl, contentDescription: 'Event Logo' },
            },
            cardTitle: {
                defaultValue: {
                    language: 'en-US',
                    value: 'Reisty Gift Card',
                },
            },
            header: {
                defaultValue: {
                    language: 'en-US',
                    value: user.fullname || 'Member',
                },
            },
            /*
            heroImage: {
                // Replace with your own hero image
                // sourceUri: { uri: ticketConfig.imageUrl },
                contentDescription: {
                    defaultValue: { language: 'en-US', value: 'Event Image' },
                },
            },
            */
            textModulesData: [
                { header: 'Points', body: user.points.toString(), id: 'points' },
                { header: 'Event', body: ticketConfig.eventName, id: 'event' },
            ],
            linksModuleData: {
                uris: [{ uri: 'https://example.com', description: 'Visit Website', id: 'website' }],
            },
            barcode: {
                type: 'QR_CODE',
                value: this.qrService.generateToken(user.id),
                alternateText: user.id,
            },
        };

        const claims = {
            iss: this.serviceAccountEmail,
            aud: 'google',
            typ: 'savetowallet',
            iat: Math.floor(Date.now() / 1000),
            origins: ['http://localhost:3000'],
            payload: {
                genericObjects: [passObject], // ✅ was loyaltyObjects
            },
        };

        const token = jwt.sign(claims, cred.private_key, { algorithm: 'RS256' });

        console.log('✅ JWT created successfully');
        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
        console.log('✅ Save URL generated', saveUrl);

        return { saveUrl, objectId };
    }

    async updatePass(user: any, changes: any) {
        const client = await this.auth.getClient();
        const objectId = `${this.issuerId}.${user.id}`;
        const url = `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}`; // ✅ was loyaltyObject

        try {
            const res = await client.request({ url, method: 'PATCH', data: changes });
            return res.data;
        } catch (error) {
            console.error('❌ Error updating Google Pass:', error);
            throw error;
        }
    }

    async deleteGenericClass() {
        const client = await this.auth.getClient();
        await client.request({
            url: `https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${this.classId}`,
            method: 'DELETE',
        });
        console.log('✅ Generic class deleted');
    }
}