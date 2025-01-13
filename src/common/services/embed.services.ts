// embed.services.ts

import {
  ChannelType,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  Guild,
  TextChannel,
} from 'discord.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbedServices {
  // Common embed creation logic
  private createEmbed(config: {
    color: ColorResolvable;
    title: string;
    description: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: string;
  }): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(config.title)
      .setDescription(config.description)
      .setTimestamp();

    if (config.fields) {
      embed.addFields(config.fields);
    }

    if (config.thumbnail) {
      embed.setThumbnail(config.thumbnail);
    }

    return embed;
  }

  async sendSuccessEmbed(
    interaction: ChatInputCommandInteraction,
    config: {
      color: ColorResolvable;
      title: string;
      description: string;
      fields?: { name: string; value: string; inline?: boolean }[];
      thumbnail?: string;
    },
  ) {
    const embed = this.createEmbed(config);
    await interaction.reply({ embeds: [embed] });
  }

  async sendErrorEmbed(
    interaction: ChatInputCommandInteraction,
    config: {
      title: string;
      description: string;
      fields?: { name: string; value: string; inline?: boolean }[];
    },
  ) {
    const embed = this.createEmbed({
      color: '#FF0000', // Use a consistent error color, e.g., red
      ...config,
    });
    await interaction.reply({ embeds: [embed] });
  }

  // Method to send embeds to channels by channel ID
  async sendSuccessEmbedToChannel(
    guild: Guild,
    channelId: string,
    config: {
      color: ColorResolvable;
      title: string;
      description: string;
      fields?: { name: string; value: string; inline?: boolean }[];
      thumbnail?: string;
    },
    content?: string,
  ) {
    const channel = guild.channels.cache.get(channelId);

    // VoiceChannel도 메시지를 보낼 수 있도록 체크 조건 수정
    if (!channel || (!channel.isTextBased() && !channel.isVoiceBased())) {
      console.error(
        `Channel with ID ${channelId} not found or cannot send messages.`,
      );
      return;
    }

    const embed = this.createEmbed(config);
    await channel.send({
      content: content,
      embeds: [embed],
    });
  }

  async sendErrorEmbedToChannel(
    guild: Guild,
    channelId: string,
    config: {
      title: string;
      description: string;
      fields?: { name: string; value: string; inline?: boolean }[];
    },
    content?: string,
  ) {
    const channel = guild.channels.cache.get(channelId) as TextChannel;
    if (!channel || ChannelType.GuildText) {
      console.error(
        `Text channel with ID ${channelId} not found or is not a text channel.`,
      );
      return;
    }

    const embed = this.createEmbed({
      color: '#FF0000', // Use a consistent error color, e.g., red
      ...config,
    });
    await channel.send({
      content: content,
      embeds: [embed],
    });
  }
}
