import { Injectable } from '@nestjs/common';
import { CommandContext } from 'src/discord/types/discord.types';
import {
  DISCORD_CONSTANTS,
  DiscordRole,
} from '../discord/constants/discord.constant';
import {
  ChatInputCommandInteraction,
  ColorResolvable,
  GuildMember,
  User,
} from 'discord.js';
import {
  MESSAGE_ACTiON,
  MESSAGE_CONSTANTS,
} from './constants/message.constant';
import { EmbedServices } from '../common/services/embed.services';

@Injectable()
export class ClanService {
  constructor(private readonly embedServices: EmbedServices) {}

  async getClanMembers(context: CommandContext) {
    const interaction = context.interaction as ChatInputCommandInteraction;
    const guild = interaction.guild;

    if (!guild) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title: '❌ 조회 실패',
        description: '서버 정보를 가져올 수 없습니다.',
      });
      return;
    }

    try {
      await guild.members.fetch();

      // 각 등급별 멤버 필터링 및 정렬
      const getMemberList = (roleId: string) => {
        return guild.members.cache
          .filter((member) => member.roles.cache.has(roleId))
          .map(
            (member) =>
              member.nickname || member.user.globalName || member.user.username,
          )
          .sort((a, b) => a.localeCompare(b));
      };

      const clanMasters = getMemberList(DiscordRole.CLAN_MASTER);
      const serverAdmins = getMemberList(DiscordRole.CLAN_SERVER_ADMIN);
      const clanAdmins = getMemberList(DiscordRole.CLAN_ADMIN);
      const clanMembers = getMemberList(DiscordRole.CLAN);

      //멤버 목록 포맷팅 함수
      const formatMembers = (members: string[]) => {
        if (members.length === 0) return '`없음`';
        return members.map((name) => `\`${name}\``).join(', ');
      };

      const fields = [
        {
          name: '👑 클랜 마스터',
          value: formatMembers(clanMasters),
          inline: false,
        },
        {
          name: '🛡️ 서버 관리자',
          value: formatMembers(serverAdmins),
          inline: false,
        },
        {
          name: '⭐ 클랜 관리자',
          value: formatMembers(clanAdmins),
          inline: false,
        },
        {
          name: '👥 클랜원',
          value: formatMembers(clanMembers),
          inline: false,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: false,
        },
        {
          name: '📊 클랜 현황',
          value: [
            `> 전체 인원: **${clanMasters.length + serverAdmins.length + clanAdmins.length + clanMembers.length}**명`,
            `> 관리진: **${clanMasters.length + serverAdmins.length + clanAdmins.length}**명`,
            `> 클랜원: **${clanMembers.length}**명`,
          ].join('\n'),
          inline: false,
        },
      ];

      await this.embedServices.sendSuccessEmbed(interaction, {
        color: '#4B9EFF',
        title: '📋 클랜 멤버 현황',
        description: '현재 등급별 클랜 멤버 목록입니다.',
        fields,
        thumbnail: interaction.guild?.iconURL() || undefined,
      });
    } catch (error) {
      console.error('Error fetching clan members:', error);
      await this.embedServices.sendErrorEmbed(interaction, {
        title: '❌ 조회 실패',
        description: '멤버 목록을 불러오는 중 오류가 발생했습니다.',
      });
    }
  }

  async registerClanMember(context: CommandContext) {
    const interaction = context.interaction as ChatInputCommandInteraction;
    const targetUser = interaction.options.getUser('user');
    const targetMember = interaction.options.getMember('user') as GuildMember;
    const config = MESSAGE_CONSTANTS.CLAN.REGISTER;

    if (
      await this.validateAdminRole(
        interaction,
        targetUser,
        targetMember,
        MESSAGE_ACTiON.REGISTER,
      )
    ) {
      return;
    }

    if (
      await this.validateMemberStatus(
        interaction,
        targetUser,
        targetMember,
        MESSAGE_ACTiON.REGISTER,
      )
    ) {
      return;
    }

    try {
      await this.updateMemberRoles(targetMember, MESSAGE_ACTiON.REGISTER);
      await this.embedServices.sendSuccessEmbed(interaction, {
        color: config.successColor as ColorResolvable,
        title: config.successTitle,
        description: [
          `${targetUser}님이 클랜에 가입되었습니다!`,
          '', // 빈 줄 추가로 간격 확보
          `• 닉네임: ${targetUser.globalName}`,
          `• 등급: 클랜원`,
          `• 가입 날짜: ${new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}`,
        ].join('\n'), // 각 줄을 개행문자로 연결
        thumbnail: targetUser.displayAvatarURL(),
      });
    } catch (error) {
      console.error(error);
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config.failTitle,
        description: `역할 부여 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }

  async updateMemberRole(context: CommandContext) {
    const interaction = context.interaction as ChatInputCommandInteraction;
    const targetUser = interaction.options.getUser('user');
    const targetMember = interaction.options.getMember('user') as GuildMember;
    const config = MESSAGE_CONSTANTS.CLAN.UPDATE; // 이 상수는 별도로 정의해야 합니다

    // 1. 서버 관리자나 마스터인 경우 체크
    if (
      targetMember.roles.cache.has(DiscordRole.CLAN_SERVER_ADMIN) ||
      targetMember.roles.cache.has(DiscordRole.CLAN_MASTER)
    ) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config?.title || '등업 실패',
        description: `${targetUser.globalName}님의 등급을 변경할 수 없습니다.`,
      });
      return;
    }

    // 2. 이미 관리자인 경우 체크
    if (targetMember.roles.cache.has(DiscordRole.CLAN_ADMIN)) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config?.title || '등업 실패',
        description: `${targetUser.globalName}님은 이미 클랜 관리자입니다.`,
      });
      return;
    }

    // 3. 클랜원이 아닌 경우 체크
    if (!targetMember.roles.cache.has(DiscordRole.CLAN)) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config?.title || '등업 실패',
        description: `${targetUser.globalName}님은 클랜원이 아닙니다.`,
      });
      return;
    }

    try {
      // 기존 역할 제거 후 관리자 역할 부여
      await targetMember.roles.remove([DiscordRole.CLAN]);
      await targetMember.roles.add(DiscordRole.CLAN_ADMIN);

      // 성공 메시지 전송
      await this.embedServices.sendSuccessEmbed(interaction, {
        color: (config?.successColor as ColorResolvable) || '#00ff00',
        title: config?.successTitle || '등업 성공',
        description: [
          `${targetUser}님이 클랜 관리자로 등업되었습니다!`,
          '',
          `• 닉네임: ${targetUser.globalName}`,
          `• 이전 등급: 클랜원`,
          `• 변경된 등급: 클랜 관리자`,
          `• 등업 날짜: ${new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}`,
        ].join('\n'),
        thumbnail: targetUser.displayAvatarURL(),
      });
    } catch (error) {
      console.error(error);
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config?.failTitle || '등업 실패',
        description: `역할 변경 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }

  async deleteClanMember(context: CommandContext) {
    const interaction = context.interaction as ChatInputCommandInteraction;
    const targetUser = interaction.options.getUser('user');
    const targetMember = interaction.options.getMember('user') as GuildMember;
    const config = MESSAGE_CONSTANTS.CLAN.DELETE;

    if (
      await this.validateAdminRole(
        interaction,
        targetUser,
        targetMember,
        MESSAGE_ACTiON.DELETE,
      )
    ) {
      return;
    }

    if (
      await this.validateMemberStatus(
        interaction,
        targetUser,
        targetMember,
        MESSAGE_ACTiON.DELETE,
      )
    ) {
      return;
    }

    try {
      const currentRole = this.getRoleName(targetMember);
      await this.updateMemberRoles(targetMember, MESSAGE_ACTiON.DELETE);
      await this.embedServices.sendSuccessEmbed(interaction, {
        color: config.successColor as ColorResolvable,
        title: config.successTitle,
        description: [
          `${targetUser}님이 클랜에서 탈퇴되었습니다.`,
          '',
          `• 닉네임: ${targetUser.globalName}`,
          `• 이전 등급: ${currentRole}`,
          `• 탈퇴 날짜: ${new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}`,
        ].join('\n'),
        thumbnail: targetUser.displayAvatarURL(),
      });
    } catch (error) {
      console.error(error);
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config.failTitle,
        description: `역할 제거 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }

  private async validateMemberStatus(
    interaction: ChatInputCommandInteraction,
    targetUser: User,
    targetMember: GuildMember,
    actionType: MESSAGE_ACTiON,
  ): Promise<boolean> {
    const hasAnyRole = DISCORD_CONSTANTS.ROLE_GROUPS.ALL.some((roleId) =>
      targetMember.roles.cache.has(roleId),
    );
    const config =
      MESSAGE_CONSTANTS.CLAN[
        actionType === MESSAGE_ACTiON.REGISTER ? 'REGISTER' : 'DELETE'
      ];

    if (actionType === MESSAGE_ACTiON.REGISTER && hasAnyRole) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config.title,
        description: `${targetUser.globalName}님은 이미 클랜 멤버입니다.`,
        fields: [
          {
            name: '현재 등급',
            value: this.getRoleName(targetMember),
            inline: true,
          },
        ],
      });
      return true;
    }

    if (actionType === MESSAGE_ACTiON.DELETE && !hasAnyRole) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title: config.title,
        description: `${targetUser.globalName}님은 클랜 멤버가 아닙니다.`,
      });
      return true;
    }

    return false;
  }

  private async validateAdminRole(
    interaction: ChatInputCommandInteraction,
    targetUser: User,
    targetMember: GuildMember,
    actionType: MESSAGE_ACTiON,
  ): Promise<boolean> {
    const hasAdminRole = DISCORD_CONSTANTS.ROLE_GROUPS.ADMIN.some((roleId) =>
      targetMember.roles.cache.has(roleId),
    );
    const title =
      actionType === MESSAGE_ACTiON.REGISTER
        ? MESSAGE_CONSTANTS.CLAN.REGISTER.title
        : MESSAGE_CONSTANTS.CLAN.DELETE.title;

    if (hasAdminRole) {
      await this.embedServices.sendErrorEmbed(interaction, {
        title,
        description: `${targetUser.globalName}님은 관리자 역할을 가지고 있어 변경이 불가능합니다.`,
      });
      return true;
    }
    return false;
  }

  private async updateMemberRoles(
    targetMember: GuildMember,
    actionType: MESSAGE_ACTiON,
  ) {
    await targetMember.roles.remove([...DISCORD_CONSTANTS.ROLE_GROUPS.ALL]);
    if (actionType === MESSAGE_ACTiON.REGISTER) {
      await targetMember.roles.add(DiscordRole.CLAN);
    }
  }

  private getRoleName(member: GuildMember): string {
    if (member.roles.cache.has(DiscordRole.CLAN_MASTER)) return '클랜 마스터';
    if (member.roles.cache.has(DiscordRole.CLAN_SERVER_ADMIN))
      return '서버 관리자';
    if (member.roles.cache.has(DiscordRole.CLAN_ADMIN)) return '클랜 관리자';
    if (member.roles.cache.has(DiscordRole.CLAN)) return '클랜원';
    return '일반 유저';
  }
}
