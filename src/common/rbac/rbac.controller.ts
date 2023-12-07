import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { Role } from '@prisma/client';
import { Public } from '../decorators';
import { Roles } from '../decorators/roles-auth.decorator';
import { RolesEnum } from 'src/auth/constants/role.enum';
import { RolesGuard } from '../guards/roles.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rbacService: RBACService) { }

  @Post()
  async createRole(@Body() roleData: { name: string, permissions: string[] }): Promise<Role> {
    const role = await this.rbacService.createRole(roleData.name, roleData.permissions);
    return role;
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() roleData: { name: string }): Promise<Role | null> {
    const updatedRole = await this.rbacService.updateRole(id, roleData.name);
    return updatedRole;
  }

  @Roles(['guest'])
  @UseGuards(RolesGuard)
  @Get()
  async getAllRoles(): Promise<Role[]> {
    const roles = await this.rbacService.getAllRoles();
    return roles;
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string): Promise<Role | null> {
    const role = await this.rbacService.getRoleById(id);
    return role;
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string): Promise<void> {
    await this.rbacService.deleteRole(id);
  }
}