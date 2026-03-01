import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MemberModule } from './modules/member/member.module';
import { TaskModule } from './modules/task/task.module';
import { MicroTaskModule } from './modules/micro-task/micro-task.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { ThanksModule } from './modules/thanks/thanks.module';
import { ImportModule } from './modules/import/import.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    MemberModule,
    TaskModule,
    MicroTaskModule,
    AssessmentModule,
    HealthCheckModule,
    ThanksModule,
    ImportModule,
    DashboardModule,
    SettingsModule,
  ],
})
export class AppModule {}
