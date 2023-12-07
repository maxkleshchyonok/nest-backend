import { Module } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { RolesController } from './rbac.controller';

@Module({
  controllers: [RolesController],  
  providers: [RBACService],
  exports: [RBACService],
})

export class RBACModule {}