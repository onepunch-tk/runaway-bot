// src/discord/services/command-registry.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { REST, Routes } from 'discord.js';
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
          this.messageHandler.registerCommand(
            commandMeta,
            boundHandler,
            roleIds,
          );
          this.slashHandler.registerCommand(commandMeta, boundHandler, roleIds);

          if (commandMeta.prefix === '/') {
            slashCommands.push({
              name: commandMeta.name,
              description: commandMeta.description || 'No description provided',
            });
          }
        }
      }
    }

    await this.registerSlashCommands(applicationId, slashCommands);
  }

  private async registerSlashCommands(applicationId: string, commands: any[]) {
    try {
      await this.rest.put(Routes.applicationCommands(applicationId), {
        body: commands,
      });
    } catch (error) {
      console.error('Error registering slash commands:', error);
      throw error;
    }
  }
}
