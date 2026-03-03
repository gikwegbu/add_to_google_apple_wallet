import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GoogleModule } from '../google/google.module';
import { AppleModule } from '../apple/apple.module';

@Module({
  imports: [GoogleModule, AppleModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
