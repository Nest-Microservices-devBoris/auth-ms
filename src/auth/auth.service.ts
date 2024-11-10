import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit{

    private readonly logger = new Logger('AuthService')

    onModuleInit() {
        this.$connect();
        this.logger.log('Mongodb connected')
    }

    async registerUser(registerUserDto: RegisterUserDto) {

        try {
            
            const { name, email, password } = registerUserDto;
            const user = await this.user.findUnique({
                where: {
                    email,
                },
            });
            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                });
            }
            const newUser = await this.user.create({
                data: {
                    name,
                    email,
                    password,
                },
            });
            return {
                user: newUser, 
            };
        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message,
            }
            );
        }
    }
}
