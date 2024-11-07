import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVER: string[];
}

const envSchema = joi.object({
  PORT: joi.number().required(),
  NATS_SERVER: joi.array().items(joi.string()).required(),
}).unknown(true);

const { error, value} = envSchema.validate({
  ...process.env,
  NATS_SERVER: process.env.NATS_SERVER?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    PORT: envVars.PORT,
    NATS_SERVER: envVars.NATS_SERVER,
}

