import { Controller } from '@nestjs/common';
import { Command } from '../discord/commands/decorators/command.decorator';
import { DiscordRole } from '../discord/constants/discord.constant';
import { CommandContext } from '../discord/commands/types/discord.types';
import { ClanService } from './clan.service';
import { RequireUser } from '../discord/commands/decorators/command-check.decorator';
import { Roles } from '../discord/commands/decorators/roles.decorator';

@Controller('clan')
export class ClanController {
  constructor(private readonly clanService: ClanService) {}
  //TODO: 클랜원 등록,탈퇴

  @Command({
    prefix: '/',
    name: '가입',
    description: '클랜원 등록 (맨션으로 대상 지정) (예: /가입 @아무개)',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  @RequireUser() // Command 데코레이터 아래로 이동
  async register(context: CommandContext) {
    await this.clanService.registerClan(context);
  }

  @Command({
    prefix: '/',
    name: '탈퇴',
    description: '클랜원 제명 (맨션으로 대상 지정) (예: /탈퇴 @아무개)',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  @RequireUser() // Command 데코레이터 아래로 이동
  async delete(context: CommandContext) {
    await this.clanService.deleteClan(context);
  }
}
