import { Injectable, Logger } from '@nestjs/common';
import { BaseCommandHandler } from './base-command.handler';
import { CommandInteraction, GuildMemberRoleManager } from 'discord.js';
import { CommandContext } from '../types/discord.types';

@Injectable()
export class SlashCommandHandler extends BaseCommandHandler {
  private readonly logger = new Logger(SlashCommandHandler.name);

  async handleInteraction(interaction: CommandInteraction) {
    try {
      const command = this.getCommand(interaction.commandName);
      if (!command) return;

      const hasPermission = await this.checkRolePermissions(
        interaction.member?.roles as GuildMemberRoleManager,
        command,
      );

      if (!hasPermission) {
        await interaction.reply({
          content: '이 명령어를 사용할 권한이 없습니다.',
          ephemeral: true,
        });
        return;
      }

      const context: CommandContext = {
        interaction,
      };
      await command.handler(context);
    } catch (error) {
      this.logger.error(
        `슬래시 명령어 처리 중 오류 발생: ${error.message}`,
        error.stack,
      );

      if (!interaction.replied) {
        await interaction.reply({
          content: '명령어 처리 중 오류가 발생했습니다.',
          ephemeral: true,
        });
      }
    }
  }
}
