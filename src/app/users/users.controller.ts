import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getMyUser(@Param('id') id: string, @Req() req) {
    return this.usersService.getMyUser(id, req);
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

}
