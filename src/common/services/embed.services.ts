import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbedServices {
  // 공통 임베드 생성 로직
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
      color: '#FFA500',
      ...config,
    });
    await interaction.reply({ embeds: [embed] });
  }

  // 채널 전송용 메소드
  async sendSuccessEmbedToChannel(
    channel: TextChannel,
    config: {
      color: ColorResolvable;
      title: string;
      description: string;
      fields?: { name: string; value: string; inline?: boolean }[];
      thumbnail?: string;
    },
    content?: string,
  ) {
    const embed = this.createEmbed(config);
    return await channel.send({
      content: content,
      embeds: [embed],
    });
  }
}
