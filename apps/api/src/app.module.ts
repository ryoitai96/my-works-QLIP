import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { AdminModule } from './modules/admin/admin.module';
import { ClientSettingsModule } from './modules/client-settings/client-settings.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MessageModule } from './modules/message/message.module';
import { CharacteristicProfileModule } from './modules/characteristic-profile/characteristic-profile.module';
import { SosModule } from './modules/sos/sos.module';
import { QrThanksModule } from './modules/qr-thanks/qr-thanks.module';
import { SiteModule } from './modules/site/site.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
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
    AdminModule,
    ClientSettingsModule,
    ProductModule,
    OrderModule,
    AttendanceModule,
    MessageModule,
    CharacteristicProfileModule,
    SosModule,
    QrThanksModule,
    SiteModule,
  ],
})
export class AppModule {}
