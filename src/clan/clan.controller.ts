import { Controller } from '@nestjs/common';
import { Command } from '../discord/decorators/command.decorator';
import { DiscordRole } from '../discord/constants/discord.constant';
import { CommandContext } from '../discord/types/discord.types';
import { ClanService } from './clan.service';
import { RequireUser } from '../discord/decorators/command-check.decorator';
import { Roles } from '../discord/decorators/roles.decorator';

@Controller('clan')
export class ClanController {
  constructor(private readonly clanService: ClanService) {}
  //TODO: 클랜원 등록,탈퇴

  @Command({
    prefix: '/',
    name: '가입',
    description: '클랜원 등록 (옵션에서 "user" 선택) (예: /가입 user:아무개)',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  @RequireUser() // Command 데코레이터 아래로 이동
  async registerClanMember(context: CommandContext) {
    await this.clanService.registerClanMember(context);
  }

  @Command({
    prefix: '/',
    name: '탈퇴',
    description: '클랜원 제명 (옵션에서 "user" 선택) (예: /탈퇴 user:아무개)',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  @RequireUser() // Command 데코레이터 아래로 이동
  async deleteClanMember(context: CommandContext) {
    await this.clanService.deleteClanMember(context);
  }

  @Command({
    prefix: '/',
    name: '등업',
    description:
      'Clan 관리자로 등업 신청 (옵션에서 "user" 선택) (예: /등업 user:아무개)',
  })
  @Roles([
    DiscordRole.CLAN_MASTER,
    DiscordRole.CLAN_ADMIN,
    DiscordRole.CLAN_SERVER_ADMIN,
  ])
  @RequireUser() // Command 데코레이터 아래로 이동
  async updateMemberRole(context: CommandContext) {
    await this.clanService.updateMemberRole(context);
  }

  @Command({
    prefix: '/',
    name: '클랜',
    description: '클랜 멤버 목록 조회',
  })
  async getClanMembers(context: CommandContext) {
    await this.clanService.getClanMembers(context);
  }
}
