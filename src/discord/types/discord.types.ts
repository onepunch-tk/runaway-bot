import { CommandInteraction, Message } from 'discord.js';
import { DiscordRole } from '../constants/discord.constant';

export interface DiscordCommandOptions {
  prefix: '!' | '/';
  name: string;
  description?: string;
  usage?: string;
}

export interface CommandContext {
  message?: Message;
  interaction?: CommandInteraction;
  args?: string[];
}

export interface CommandInfo {
  handler: CommandHandler;
  meta: DiscordCommandOptions;
  roleIds?: DiscordRole[];
}

export type CommandHandler = (context: CommandContext) => Promise<void>;
