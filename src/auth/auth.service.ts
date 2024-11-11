import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';
@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit{

    private readonly logger = new Logger('AuthService')

    constructor(private readonly jwtService: JwtService) {
        super();
    }

    onModuleInit() {
        this.$connect();
        this.logger.log('Mongodb connected')
    }

    async signJWT(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    async verifyToken(token: string) {

        try {
            const { sub, iat, exp, ...user} = this.jwtService.verify(token, {secret: envs.JWT_SECRET});
            
            return {
                user: user,
                token: await this.signJWT(user),
            };

        } catch (error) {
            console.log(error);
            throw new RpcException({
                status: 401,
                message: error.message,
            }
            );
        }
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
                    name:name,
                    email: email,
                    password: bcrypt.hashSync(password, 10),
                },
            });

            const { password: __, ...restUser} = newUser;

            return {
                user: restUser,
                token: await this.signJWT( restUser) 
            };
        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message,
            }
            );
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {

        try {
            
            const { email, password } = loginUserDto;
            const user = await this.user.findUnique({
                where: {
                    email,
                },
            });
            if (!user) {
                throw new RpcException({
                    status: 400,
                    message: 'credentials not valid'
                });
            }

            const ispasswordValid = bcrypt.compareSync(password, user.password);
            if (!ispasswordValid) {
                throw new RpcException({
                    status: 400,
                    message: 'credentials not valid'
                });
            }
            

            const { password: __, ...restUser} = user;

            return {
                user: restUser,
                token: await this.signJWT( restUser) 
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
