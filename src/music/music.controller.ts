import { Controller } from '@nestjs/common';
import { Command } from '../discord/decorators/command.decorator';
import { DiscordRole } from '../discord/constants/discord.constant';
import { CommandContext } from '../discord/types/discord.types';
import { MusicService } from './music.service';
import { Roles } from '../discord/decorators/roles.decorator';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Command({
    prefix: '/',
    name: 'play',
    description: '노동요를 재생합니다.',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  async play(context: CommandContext) {
    await this.musicService.play(context);
  }

  @Command({
    prefix: '/',
    name: 'stop',
    description: '노동요를 중지합니다.',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  async stop(context: CommandContext) {
    await this.musicService.stop(context);
  }
}
