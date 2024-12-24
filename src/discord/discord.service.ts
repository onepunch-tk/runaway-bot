import { DISCORD_CONSTANTS } from './constants/discord.constant';
import { DiscordClientService } from './services/discord-client.service';
import { CommandRegistryService } from './services/command-registry.service';
import { MessageCommandHandler } from './commands/handlers/message-command.handler';
import { SlashCommandHandler } from './commands/handlers/slash-command.handler';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  constructor(
    private readonly discordClient: DiscordClientService,
    private readonly commandRegistry: CommandRegistryService,
    private readonly messageHandler: MessageCommandHandler,
    private readonly slashHandler: SlashCommandHandler,
  ) {}

  async onModuleInit() {
    this.client = await this.discordClient.connect();

    if (!this.client.application?.id) {
      throw new Error('Failed to initialize Discord client');
    }

    // Ready 이벤트 핸들러 추가
    this.client.once('ready', async () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);

      if (!this.client.application?.id) {
        throw new Error('Failed to initialize Discord client');
      }

      await this.commandRegistry.registerCommands(this.client.application.id);
      await this.setupEventHandlers();
    });

    // await this.commandRegistry.registerCommands(this.client.application.id);
    // await this.setupEventHandlers();
  }

  private async setupEventHandlers() {
    this.client.on(DISCORD_CONSTANTS.EVENTS.MESSAGE_CREATE, async (message) => {
      if (message.author.bot) return;
      await this.messageHandler.handleMessage(message);
    });

    this.client.on(
      DISCORD_CONSTANTS.EVENTS.INTERACTION_CREATE,
      async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        await this.slashHandler.handleInteraction(interaction);
      },
    );
  }
}
