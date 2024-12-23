import { GuildMemberRoleManager } from 'discord.js';
import {
  CommandHandler,
  CommandInfo,
  DiscordCommandOptions,
} from '../types/discord.types';

export abstract class BaseCommandHandler {
  protected readonly commands = new Map<string, CommandInfo>();

  registerCommand(
    meta: DiscordCommandOptions,
    handler: CommandHandler,
    roleIds?: string[],
  ) {
    this.commands.set(meta.name, {
      handler,
      meta,
      roleIds,
    });
  }

  getCommand(name: string): CommandInfo | undefined {
    return this.commands.get(name);
  }

  protected async checkRolePermissions(
    memberRoles: GuildMemberRoleManager | string[],
    command: CommandInfo,
  ): Promise<boolean> {
    if (!command.roleIds || command.meta.isGlobal) return true;
    if (!memberRoles) return false;

    if (Array.isArray(memberRoles)) {
      // string[] 타입인 경우
      return command.roleIds.some((roleId) => memberRoles.includes(roleId));
    } else {
      // GuildMemberRoleManager 타입인 경우
      return command.roleIds.some((roleId) => memberRoles.cache.has(roleId));
    }
  }
}
