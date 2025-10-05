import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: { email: string; password: string; username: string }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      },
    });
    return { token: this.createToken(user) };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new BadRequestException('Invalid credentials');
    }
    return { access_token: this.createToken(user) };
  }

  private createToken(user: any) {
    const payload = { sub: user.id, username: user.username };
    const access_token = this.jwt.sign(payload);
    return { access_token: access_token };
  }
}
