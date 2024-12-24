import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { DiscordClientService } from './services/discord-client.service';
import { DiscoveryService } from '@nestjs/core';
import { CommandRegistryService } from './services/command-registry.service';
import { MessageCommandHandler } from './commands/handlers/message-command.handler';
import { SlashCommandHandler } from './commands/handlers/slash-command.handler';
import { DiscordRestProvider } from './providers/discord-rest.provider';

@Module({
  imports: [
    /* 커맨드 모듈 선언 */
  ],
  providers: [
    DiscordService,
    DiscordClientService,
    DiscoveryService,
    CommandRegistryService,
    MessageCommandHandler,
    SlashCommandHandler,
    DiscordRestProvider,
    ConfigService,
  ],
  exports: [DiscordService],
})
export class DiscordModule {}
