import { NestFactory } from '@nestjs/core';
import { AppleModule } from './src/apple/apple.module';
import { AppleService } from './src/apple/apple.service';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './src/config/env.config';
import * as fs from 'fs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(
        ConfigModule.forRoot({
            load: [envConfig],
            isGlobal: true,
        }),
    );

    // We need to provide AppleService, but it's in AppleModule
    const appleServiceContext = await NestFactory.createApplicationContext(AppleModule);
    const appleService = appleServiceContext.get(AppleService);

    // Manually call onModuleInit if not called
    await appleService.onModuleInit();

    const user = { id: 'test-user-123', fullname: 'Test User', points: 500 };
    const ticketConfig = { eventName: 'Verification Event' };

    try {
        console.log('Generating pass buffer...');
        const buffer = await appleService.generatePassBuffer(user, ticketConfig);
        fs.writeFileSync('test-pass.pkpass', buffer);
        console.log('✅ Pass generated successfully: test-pass.pkpass');
    } catch (error) {
        console.error('❌ Pass generation failed:', error);
    } finally {
        await app.close();
        await appleServiceContext.close();
    }
}

bootstrap();
