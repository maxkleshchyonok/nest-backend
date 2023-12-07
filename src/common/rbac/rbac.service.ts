import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RBACService {
    constructor(private readonly prisma: PrismaService) { }

    async createRole(name: string, permissions: string[]): Promise<Role> {
        const roleData: Prisma.RoleCreateInput = {
            name: name,
            permissions: permissions,
        }
        const role = await this.prisma.role.create({ data: roleData });
        return role;
    }


    async updateRole(id: string, name: string): Promise<Role | null> {
        return this.prisma.role.update({
            where: { id },
            data: { name },
        });
    }

    async getAllRoles(): Promise<Role[]> {
        return this.prisma.role.findMany();
    }

    async getRoleByName(name: string): Promise<Role | null> {
        const role = await this.prisma.role.findUnique({ where: { name } });
        return role;
    }

    async getRoleById(id: string): Promise<Role | null> {
        return this.prisma.role.findUnique({
            where: { id },
        });
    }

    // async assignRoleToUser(userId: string, roleId: number): Promise<void> {
    //     await this.prisma.user.update({
    //         where: { id: userId },
    //         data: {
    //             userRoles: {
    //                 create: {
    //                     role: { connect: { id: roleId } }
    //                 }
    //             }
    //         },
    //     });
    // }


    async deleteRole(id: string): Promise<void> {
        await this.prisma.role.delete({
            where: { id },
        });
    }

    // async checkPermission(userId: string, permission: string): Promise<boolean> {
    //     const user = await this.prisma.user.findUnique({
    //         where: { id: userId },
    //         include: { userRoles: { include: { role: true } } },
    //     });

    //     if (!user) {
    //         return false;
    //     }

    //     for (const userRole of user.userRoles) {
    //         if (userRole.role.permissions.includes(permission)) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }
}