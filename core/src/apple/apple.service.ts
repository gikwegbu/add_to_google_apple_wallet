import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import type { Template } from '@walletpass/pass-js';
import { Template as TemplateClass } from '@walletpass/pass-js';

@Injectable()
export class AppleService {
    private template: InstanceType<typeof TemplateClass>;
    private cert: Buffer;
    private key: Buffer;
    private wwdr: Buffer;

    constructor(private configService: ConfigService) {
        // We will initialize this lazily or in onModuleInit to avoid startup errors if files missing
    }

    async onModuleInit() {
        const rootDir = path.resolve(process.cwd(), '..');
        const certPath = path.resolve(rootDir, this.configService.get<string>('apple.certPath') || '');
        const keyPath = path.resolve(rootDir, this.configService.get<string>('apple.keyPath') || '');
        const wwdrPath = path.resolve(rootDir, this.configService.get<string>('apple.wwdrPath') || '');
        const templatePath = path.resolve(rootDir, 'apple/templates');

        console.log('🔍 Resolving Apple Wallet paths:');
        console.log(' - Cert:', certPath);
        console.log(' - Key:', keyPath);
        console.log(' - WWDR:', wwdrPath);
        console.log(' - Template:', templatePath);

        const missingFiles: string[] = [];
        if (!fs.existsSync(certPath)) missingFiles.push('Cert');
        if (!fs.existsSync(keyPath)) missingFiles.push('Key');
        if (!fs.existsSync(wwdrPath)) missingFiles.push('WWDR');
        if (!fs.existsSync(templatePath)) missingFiles.push('Template');

        if (missingFiles.length === 0) {
            this.cert = fs.readFileSync(certPath);
            this.key = fs.readFileSync(keyPath);
            this.wwdr = fs.readFileSync(wwdrPath);

            try {
                this.template = await TemplateClass.load(templatePath);
                this.template.setCertificate(this.cert);
                this.template.setPrivateKey(this.key, this.configService.get<string>('apple.certPassphrase'));
                this.template.wwdrCertificate = this.wwdr;

                console.log('✅ Apple Wallet template and certificates loaded successfully');
            } catch (error) {
                console.error('❌ Error loading Apple Wallet template/certs:', error);
            }
        } else {
            console.warn(`⚠️ Apple Wallet files missing: ${missingFiles.join(', ')}. Pass generation will be disabled.`);
        }
    }

    async createPass(user: any, ticketConfig: any) {
        if (!this.template) {
            console.error('❌ Apple Wallet template not initialized');
            return {
                passTypeIdentifier: this.configService.get('apple.passTypeIdentifier'),
                serialNumber: user.id,
                webServiceURL: `${this.configService.get('API_BASE_URL')}/api/apple`,
                authenticationToken: 'mock-token-' + user.id,
            };
        }

        const pass = this.template.createPass({
            serialNumber: user.id,
        });

        // Set pass field values
        // pass-js fields are often accessed via specialized methods or arrays
        pass.primaryFields.add({ key: 'event', label: 'EVENT', value: ticketConfig.eventName });
        pass.secondaryFields.add({ key: 'customerName', label: 'CUSTOMER', value: user.fullname || 'Member' });
        pass.auxiliaryFields.add({ key: 'points', label: 'REWARD POINTS', value: user.points.toString() });

        // Set barcode (defensive check for barcodes vs barcode)
        if (pass.barcodes && typeof (pass.barcodes as any).add === 'function') {
            (pass.barcodes as any).add({
                message: user.id,
                format: 'PKBarcodeFormatQR',
                messageEncoding: 'iso-8859-1',
            });
        } else if (pass.barcodes && Array.isArray(pass.barcodes)) {
            (pass.barcodes as any).push({
                message: user.id,
                format: 'PKBarcodeFormatQR',
                messageEncoding: 'iso-8859-1',
            });
        } else {
            console.warn('⚠️ pass.barcodes is missing or incompatible. Available properties:', Object.keys(pass));
        }

        const authenticationToken = 'auth-' + Math.random().toString(36).substring(7);

        const webServiceURL = `${this.configService.get('API_BASE_URL')}/api/apple`;
        if (webServiceURL.startsWith('https://')) {
            pass.webServiceURL = webServiceURL;
            pass.authenticationToken = authenticationToken;
        } else {
            console.warn(`⚠️ Apple Wallet webServiceURL must be HTTPS. Skipping for URL: ${webServiceURL}`);
        }

        return {
            passTypeIdentifier: this.configService.get('apple.passTypeIdentifier'),
            serialNumber: user.id,
            webServiceURL: pass.webServiceURL,
            authenticationToken: authenticationToken,
            pass,
        };
    }

    async generatePassBuffer(user: any, ticketConfig: any): Promise<Buffer> {
        const result = await this.createPass(user, ticketConfig);
        if (result.pass && typeof result.pass.asBuffer === 'function') {
            return await result.pass.asBuffer();
        }
        throw new Error('Pass generation failed');
    }
}
