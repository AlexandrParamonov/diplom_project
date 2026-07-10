import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

type UserResponse = Omit<User, 'passwordHash'>;

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    const user = await this.usersService.create(createUserDto);

    return this.toResponse(user);
  }

  @Get()
  async findAll(@Query() query: SearchUserDto): Promise<UserResponse[]> {
    const users = await this.usersService.findAll(query);

    return users.map((user) => this.toResponse(user));
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    const user = await this.usersService.findById(id);

    return this.toResponse(user);
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
