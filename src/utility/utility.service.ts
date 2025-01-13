import { Injectable } from '@nestjs/common';
import { GuildMember, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { DISCORD_WELCOME_CHANNEL_ID } from '../common/constant/env.constant';
import { EmbedServices } from '../common/services/embed.services';

@Injectable()
export class UtilityService {
  constructor(
    private readonly configService: ConfigService,
    private readonly embedService: EmbedServices,
  ) {}
  async handleWelcomeMessage(member: GuildMember) {
    const welcomeChannelId = this.configService.get<string>(
      DISCORD_WELCOME_CHANNEL_ID,
    );

    const welcomeChannel = member.guild.channels.cache.get(
      welcomeChannelId,
    ) as TextChannel;

    if (!welcomeChannel?.isTextBased()) return;

    const welcomeFields = [
      {
        name: '💬 채팅 채널 안내',
        value: [
          '> 🎮 `라운지` - 자유로운 소통이 가능한 메인 채팅 채널',
          '> 🍗 `치킨자랑` - 치킨 획득 스크린샷 공유 채널',
          '> 🔑 `우리끼리-클랜-전용` - 클랜원 전용 비공개 채널',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🎮 게임 음성채널',
        value: [
          '> 🎯 `빠참방` - 빠른참가 모드를 위한 음성채널',
          '> 🌴 `사녹` - 사녹 맵 전용 음성채널',
          '> ⚔️ `경쟁방` - 경쟁전 모드를 위한 음성채널',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🎻 음악 채널',
        value: [
          '> 🎵 음악 감상을 위한 전용 채널',
          '> 🤖 음악 봇 외 모든 유저는 자동 음소거',
          '> 🎧 게임하면서 음악을 즐기고 싶을 때 입장해보세요!',
        ].join('\n'),
        inline: false,
      },
      {
        name: '📊 서버 현황',
        value: [
          `> 현재 서버 인원: **${member.guild.memberCount}**명`,
          `> 서버 생성일: <t:${Math.floor(member.guild.createdTimestamp / 1000)}:R>`,
        ].join('\n'),
        inline: false,
      },
    ];

    await this.embedService.sendSuccessEmbedToChannel(
      member.guild, // Guild
      welcomeChannelId, // Channel ID
      {
        color: '#4B9EFF',
        title: `✨ ${member.user.globalName}님 환영합니다!`,
        description: [
          `${member.guild.name} 클랜 서버 놀러오신 것을 진심으로 환영합니다! 🎉`,
          '',
          '아래 안내사항을 확인하시고 즐거운 시간 보내세요!',
        ].join('\n'),
        fields: welcomeFields,
        thumbnail: member.user.displayAvatarURL({ size: 256 }),
      },
    );
  }
}
