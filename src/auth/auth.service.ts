import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from 'src/domain/dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Tokens } from './types/tokens.type';
import { RolesEnum } from './constants/role.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    async signup(dto: AuthDto): Promise<Tokens> {
        const { email, password } = dto;

        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        let role = await this.prisma.role.findUnique({ where: { name: RolesEnum.GUEST } });

        if (foundUser) {
            throw new BadRequestException('User already exists');
        }

        if (!role) {
            role = await this.createGuestRole();
        }

        const hashedPassword = await this.hashPassword(password);

        const newRole = await this.prisma

        const newUser = await this.prisma.user.create({
            data: {
                email,
                hashedPassword,
                userRoles: {
                    connect: {
                        id: role.id
                    },
                }
            }
        });



        const tokens = await this.signToken({ id: newUser.id, email: newUser.email });

        await this.updateRtHash(newUser.id, tokens.refresh_token);

        return tokens;
    }

    async signin(dto: AuthDto): Promise<Tokens> {
        const { email, password } = dto;

        const foundUser = await this.prisma.user.findUnique({ where: { email } });

        if (!foundUser) {
            throw new BadRequestException('Incorrect email or password!');
        }

        const isMatch = await this.comparePasswords({
            password,
            hash: foundUser.hashedPassword
        });

        if (!isMatch) {
            throw new BadRequestException('Incorrect email or password!');
        }

        const tokens = await this.signToken({
            id: foundUser.id,
            email: foundUser.email
        });

        if (!tokens) {
            throw new ForbiddenException();
        }

        await this.updateRtHash(foundUser.id, tokens.refresh_token);

        //res.cookie('token', tokens);

        return tokens;

    }

    async signout(req: Request, res: Response) {
        res.clearCookie('token');
        return res.send({ message: 'Successfully logged out!' });
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRt: {
                    not: null,
                },
            },
            data: {
                hashedRt: null
            }
        });
    }

    async hashPassword(password: string) {
        const saltOrRounds = 6;
        return await bcrypt.hash(password, saltOrRounds);
    }

    async comparePasswords(args: { password: string; hash: string }) {
        return await bcrypt.compare(args.password, args.hash);
    }

    async signToken(args: { id: string; email: string }) {
        const [at, rt] = await Promise.all([
            this.jwt.signAsync(
                {
                    sub: args.id,
                    email: args.email
                },
                {
                    secret: 'at-secret',
                    expiresIn: '60s',
                },
            ),
            this.jwt.signAsync(
                {
                    sub: args.id,
                    email: args.email
                },
                {
                    secret: 'rt-secret',
                    expiresIn: '5d',
                }
            )
        ]);

        return {
            access_token: at,
            refresh_token: rt
        };
    }

    async updateRtHash(userId: string, rt: string) {
        const hash = await this.hashPassword(rt);
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                hashedRt: hash,
            }
        });
    }

    async refreshTokens(userId: string, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        });
        if (!user || !user.hashedRt) {
            throw new ForbiddenException('Access denied');
        }
        const rtMatches = bcrypt.compare(rt, user.hashedRt);
        if (!rtMatches) {
            throw new ForbiddenException('Access denied')
        }
        const tokens = await this.signToken({ id: user.id, email: user.email });
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async createGuestRole() {
        const roleData: Prisma.RoleCreateInput = {
            name: RolesEnum.GUEST,
            permissions: ['read'],
        }
        return this.prisma.role.create({ data: roleData });
    }

}
