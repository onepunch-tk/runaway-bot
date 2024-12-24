import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
} from 'discord.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbedHandler {
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
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(config.title)
      .setDescription(config.description)
      .setTimestamp();

    if (config.fields) {
      embed.addFields(config.fields);
    }

    await interaction.reply({ embeds: [embed] });
  }
}
