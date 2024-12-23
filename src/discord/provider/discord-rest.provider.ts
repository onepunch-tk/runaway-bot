import { ConfigService } from '@nestjs/config';
import { REST } from 'discord.js';
import { DISCORD_BOT_TOKEN } from '../../common/constant/env.constant';
import { Provider } from '@nestjs/common';
import { DISCORD_CONSTANTS } from '../constants/discord.constant';

export const DiscordRestProvider: Provider = {
  provide: DISCORD_CONSTANTS.PROVIDERS.DISCORD_REST,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new REST({ version: '10' }).setToken(
      configService.get(DISCORD_BOT_TOKEN),
    );
  },
};
