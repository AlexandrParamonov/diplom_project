import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await hash(data.password, 10);

    const user = this.usersRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      contactPhone: data.contactPhone ?? null,
      role: data.role,
    });

    return this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findAll(params: SearchUserDto): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'ASC')
      .take(params.limit ?? 20)
      .skip(params.offset ?? 0);

    if (params.email) {
      query.andWhere('LOWER(user.email) LIKE :email', {
        email: `%${params.email.toLowerCase()}%`,
      });
    }

    if (params.name) {
      query.andWhere('LOWER(user.name) LIKE :name', {
        name: `%${params.name.toLowerCase()}%`,
      });
    }

    if (params.contactPhone) {
      query.andWhere('user.contactPhone LIKE :contactPhone', {
        contactPhone: `%${params.contactPhone}%`,
      });
    }

    return query.getMany();
  }
}
