import { DISCORD_BOT_TOKEN } from '../../common/constant/env.constant';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { DISCORD_CONSTANTS } from '../constants/discord.constant';

@Injectable()
export class DiscordClientService {
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: Object.values(DISCORD_CONSTANTS.INTENTS),
    });
  }

  async connect() {
    const token = this.configService.get<string>(DISCORD_BOT_TOKEN);
    if (!token) {
      throw new Error('Discord bot token is not configured');
    }

    try {
      await this.client.login(token);
      return this.client;
    } catch (error) {
      throw new Error(`Failed to connect to Discord: ${error.message}`);
    }
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('Discord client is not initialized');
    }
    return this.client;
  }

  async destroy() {
    await this.client?.destroy();
  }
}
