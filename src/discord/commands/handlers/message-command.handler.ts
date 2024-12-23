import { Injectable, Logger } from '@nestjs/common';
import { BaseCommandHandler } from './base-command.handler';
import { Message } from 'discord.js';
import { CommandContext } from '../types/discord.types';

@Injectable()
export class MessageCommandHandler extends BaseCommandHandler {
  private readonly logger = new Logger(MessageCommandHandler.name);

  async handleMessage(message: Message) {
    try {
      const prefix = message.content.charAt(0);
      const args = message.content.slice(1).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      if (!commandName) return;

      const command = this.getCommand(commandName);
      if (!command || command.meta.prefix !== prefix) return;

      const hasPermission = await this.checkRolePermissions(
        message.member?.roles,
        command,
      );

      if (!hasPermission) {
        await message.reply('이 명령어를 사용할 권한이 없습니다.');
        return;
      }

      const context: CommandContext = {
        message,
        args,
      };

      await command.handler(context);
    } catch (error) {
      this.logger.error(
        `메시지 처리 중 오류 발생: ${error.message}`,
        error.stack,
      );
      await message.reply('명령어 처리 중 오류가 발생했습니다.');
    }
  }
}
