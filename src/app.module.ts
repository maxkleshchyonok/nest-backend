import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './app/users/users.module';
import { AtGuard } from './common/guards';
import { APP_GUARD } from '@nestjs/core';
import { RBACModule } from './common/rbac/rbac.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, RBACModule],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AtGuard
    // }
  ]
})
export class AppModule {}
