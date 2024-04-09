import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';
import { SchedulerService } from './schedule.service';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
