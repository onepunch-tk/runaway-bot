import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApplicationCommandOptionType, Client, REST, Routes } from 'discord.js';
import { DISCORD_CONSTANTS } from './discord/constants/discord.constant';
import { DiscoveryService } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  DISCORD_BOT_TOKEN,
  DISCORD_TEST_SERVER_ID,
} from './common/constant/env.constant';
import { MessageService } from './discord/services/message.service';
import { InteractionService } from './discord/services/interaction.service';
import { UtilityService } from './utility/utility.service';
import { MusicService } from './music/music.service';

@Injectable()
export class AppService implements OnModuleInit {
  private client: Client;
  private rest: REST;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
    private readonly interactionService: InteractionService,
    private readonly utilityService: UtilityService,
    private readonly musicService: MusicService,
  ) {
    this.client = new Client({
      intents: Object.values(DISCORD_CONSTANTS.INTENTS),
    });

    this.rest = new REST({ version: '10' }).setToken(
      this.configService.get(DISCORD_BOT_TOKEN),
    );
  }

  async onModuleInit() {
    await this.connect();

    if (!this.client.application?.id) {
      throw new Error('Failed to initialize Discord client');
    }

    // Ready 이벤트 핸들러 추가
    this.client.once('ready', async () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);

      if (!this.client.application?.id) {
        throw new Error('Failed to initialize Discord client');
      }

      await this.registerCommands(this.client.application.id);
      await this.setupEventHandlers();
      await this.musicService.test(this.client);
    });
  }

  private async connect() {
    const token = this.configService.get<string>(DISCORD_BOT_TOKEN);
    if (!token) {
      throw new Error('Discord bot token is not configured');
    }

    try {
      await this.client.login(token);
    } catch (error) {
      throw new Error(`Failed to connect to Discord: ${error.message}`);
    }
  }

  private async setupEventHandlers() {
    this.client.on(DISCORD_CONSTANTS.EVENTS.MESSAGE_CREATE, async (message) => {
      if (message.author.bot) return;
      await this.messageService.handleMessage(message);
    });

    this.client.on(
      DISCORD_CONSTANTS.EVENTS.INTERACTION_CREATE,
      async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        await this.interactionService.handleInteraction(interaction);
      },
    );

    this.client.on(
      DISCORD_CONSTANTS.EVENTS.GUILD_MEMBER_ADD,
      async (member) => {
        await this.utilityService.handleWelcomeMessage(member);
      },
    );
  }

  private async registerCommands(applicationId: string) {
    const controllers = this.discoveryService.getControllers();
    const slashCommands = [];
    for (const controller of controllers) {
      const instance = controller.instance;
      const prototype = Object.getPrototypeOf(instance);

      for (const methodName of Object.getOwnPropertyNames(prototype)) {
        const method = prototype[methodName];
        const commandMeta = Reflect.getMetadata(
          DISCORD_CONSTANTS.METADATA.COMMAND_KEY,
          method,
        );
        const roleIds = Reflect.getMetadata(
          DISCORD_CONSTANTS.METADATA.ROLES_KEY,
          method,
        );
        if (commandMeta) {
          const boundHandler = method.bind(instance);

          // 모든 핸들러에 등록
          if (commandMeta.prefix === '!') {
            this.messageService.registerCommand(
              commandMeta,
              boundHandler,
              roleIds,
            );
          }

          if (commandMeta.prefix === '/') {
            this.interactionService.registerCommand(
              commandMeta,
              boundHandler,
              roleIds,
            );
            slashCommands.push({
              name: commandMeta.name,
              description: commandMeta.description || 'No description provided',
              options: [
                {
                  name: 'user',
                  description: '대상 사용자',
                  type: ApplicationCommandOptionType.User, // User 타입으로 지정
                  required: false, // 필수 여부
                },
              ],
            });
          }
        }
      }
    }

    await this.registerSlashCommands(applicationId, slashCommands);
  }

  private async registerSlashCommands(applicationId: string, commands: any[]) {
    try {
      // 글로벌 커맨드 대신 특정 길드에 등록
      const guildId = this.configService.get(DISCORD_TEST_SERVER_ID); // 테스트 서버 ID
      await this.rest.put(
        Routes.applicationGuildCommands(applicationId, guildId),
        { body: commands },
      );

      // 또는 여러 길드에 동시 등록
      // const guildIds = ['GUILD_ID_1', 'GUILD_ID_2'];
      // await Promise.all(
      //   guildIds.map(guildId =>
      //     this.rest.put(
      //       Routes.applicationGuildCommands(applicationId, guildId),
      //       { body: commands }
      //     )
      //   )
      // );
    } catch (error) {
      console.error('Error registering slash commands:', error);
      throw error;
    }
  }
}
