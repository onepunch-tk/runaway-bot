// src/discord/services/command-registry.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ApplicationCommandOptionType, REST, Routes } from 'discord.js';
import { MessageCommandHandler } from '../commands/handlers/message-command.handler';
import { SlashCommandHandler } from '../commands/handlers/slash-command.handler';
import { DISCORD_CONSTANTS } from '../constants/discord.constant';

@Injectable()
export class CommandRegistryService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly messageHandler: MessageCommandHandler,
    private readonly slashHandler: SlashCommandHandler,
    @Inject(DISCORD_CONSTANTS.PROVIDERS.DISCORD_REST)
    private readonly rest: REST,
  ) {}

  async registerCommands(applicationId: string) {
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
            this.messageHandler.registerCommand(
              commandMeta,
              boundHandler,
              roleIds,
            );
          }

          if (commandMeta.prefix === '/') {
            this.slashHandler.registerCommand(
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
      const guildId = '1218141133696270356'; // 테스트 서버 ID
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
