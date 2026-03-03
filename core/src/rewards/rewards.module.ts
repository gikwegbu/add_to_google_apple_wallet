import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { QrModule } from '../qr/qr.module';
import { GoogleModule } from '../google/google.module';

@Module({
  imports: [QrModule, GoogleModule],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule { }
