import { Module } from '@nestjs/common';
import { AppleService } from './apple.service';
import { AppleController } from './apple.controller';

@Module({
  controllers: [AppleController],
  providers: [AppleService],
  exports: [AppleService],
})
export class AppleModule { }
