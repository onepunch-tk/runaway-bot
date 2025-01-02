import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import * as Joi from 'joi';
import { DiscoveryService } from '@nestjs/core';
import { AppService } from './app.service';
import { ClanModule } from './clan/clan.module';
import { UtilityModule } from './utility/utility.module';

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
    AuthModule,
    DiscordModule,
    ClanModule,
    UtilityModule,
  ],
  providers: [DiscoveryService, AppService],
})
export class AppModule {}
