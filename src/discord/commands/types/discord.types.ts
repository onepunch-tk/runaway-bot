import { CommandInteraction, Message } from 'discord.js';

export interface DiscordCommandOptions {
  prefix: '!' | '/';
  name: string;
  description?: string;
  usage?: string;
  isGlobal?: boolean;
}

export interface CommandContext {
  message?: Message;
  interaction?: CommandInteraction;
  args?: string[];
}

export interface CommandInfo {
  handler: CommandHandler;
  meta: DiscordCommandOptions;
  roleIds?: string[];
}

export type CommandHandler = (context: CommandContext) => Promise<void>;
