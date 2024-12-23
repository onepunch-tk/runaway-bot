import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import {
  DISCORD_APP_ID,
  DISCORD_CALLBACK_URL,
  DISCORD_CLIENT_SECRET,
} from '../../common/constant/env.constant';

export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(DISCORD_APP_ID),
      clientSecret: configService.get<string>(DISCORD_CLIENT_SECRET),
      callbackURL: configService.get<string>(DISCORD_CALLBACK_URL),
      scope: ['identify', 'guilds', 'email'],
    });
  }
}
