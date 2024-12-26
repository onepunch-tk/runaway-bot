import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClanController } from './clan/clan.controller';
import { ClanService } from './clan/clan.service';
import { CommonModule } from './common/common.module';

import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DISCORD_APP_ID: Joi.string().required(),
        DISCORD_BOT_TOKEN: Joi.string().required(),
        DISCORD_PUBLIC_KEY: Joi.string().required(),
        /* 필요하다면 사용 */
        // DISCORD_CLIENT_SECRET: Joi.string().required(),
        // DISCORD_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    DiscordModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [ClanController],
  providers: [ClanService],
})
export class AppModule {}
