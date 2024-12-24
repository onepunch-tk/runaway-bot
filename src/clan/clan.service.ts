import { Injectable } from '@nestjs/common';
import { CommandContext } from 'src/discord/commands/types/discord.types';
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
import { EmbedHandler } from '../common/handlers/embed.handler';

@Injectable()
export class ClanService {
  constructor(private readonly embedHandler: EmbedHandler) {}

  async registerClan(context: CommandContext) {
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
      await this.embedHandler.sendSuccessEmbed(interaction, {
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
      await this.embedHandler.sendErrorEmbed(interaction, {
        title: config.failTitle,
        description: `역할 부여 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }

  async deleteClan(context: CommandContext) {
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
      await this.embedHandler.sendSuccessEmbed(interaction, {
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
      await this.embedHandler.sendErrorEmbed(interaction, {
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
      await this.embedHandler.sendErrorEmbed(interaction, {
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
      await this.embedHandler.sendErrorEmbed(interaction, {
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
      await this.embedHandler.sendErrorEmbed(interaction, {
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
