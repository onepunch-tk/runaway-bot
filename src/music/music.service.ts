// music.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Guild, TextChannel, VoiceChannel } from 'discord.js';
import { EmbedServices } from '../common/services/embed.services';
import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
} from '@discordjs/voice';
import ytdl from 'youtube-dl-exec';
import { CommandContext } from '../discord/types/discord.types';

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);
  private readonly FIXED_NCS_URL =
    'https://www.youtube.com/watch?v=0sz65RS4KQs';
  private readonly MUSIC_CHANNEL_ID = '1321762179887796305';
  private isPlaying = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly embedServices: EmbedServices,
  ) {}

  async play(context: CommandContext): Promise<void> {
    const { interaction } = context;
    if (!interaction) {
      this.logger.error('Interaction이 존재하지 않습니다.');
      return;
    }

    await interaction.reply('🎵 노동요 재생을 준비중입니다...');

    const guild = interaction.guild;
    if (!guild) {
      throw new Error('서버를 찾을 수 없습니다.');
    }

    try {
      if (this.isPlaying) {
        await interaction.editReply('🎵 이미 음악이 재생 중입니다.');
        return;
      }

      const voiceChannel = this.getVoiceChannel(guild, this.MUSIC_CHANNEL_ID);
      const textChannel = voiceChannel as unknown as TextChannel;

      const { audioPlayer, connection } = await this.setupAudioPlayer(
        this.FIXED_NCS_URL,
        voiceChannel,
      );

      this.handleAudioPlayerEvents(audioPlayer, connection, textChannel);
      this.isPlaying = true;

      await interaction.editReply('🎵 노동요 재생을 시작합니다.');

      await this.embedServices.sendSuccessEmbedToChannel(
        guild,
        this.MUSIC_CHANNEL_ID,
        {
          color: '#00FF00',
          title: '음악 재생',
          description: '🎵 노동요 재생을 시작합니다.',
        },
      );
    } catch (error) {
      this.logger.error('음악 재생 중 오류 발생:', error);
      await interaction.editReply(`❌ 오류: ${error.message}`);
    }
  }

  async stop(context: CommandContext): Promise<void> {
    const { interaction } = context;
    if (!interaction) {
      this.logger.error('Interaction이 존재하지 않습니다.');
      return;
    }

    await interaction.reply('🎵 노동요 중지를 준비중입니다...');

    const guild = interaction.guild;
    if (!guild) {
      throw new Error('서버를 찾을 수 없습니다.');
    }

    try {
      if (!this.isPlaying) {
        await interaction.editReply('🎵 현재 재생 중인 음악이 없습니다.');
        return;
      }

      const connection = getVoiceConnection(guild.id);
      if (connection) {
        connection.destroy();
        this.isPlaying = false;

        await interaction.editReply('🎵 음악 재생을 중지했습니다.');

        await this.embedServices.sendSuccessEmbedToChannel(
          guild,
          this.MUSIC_CHANNEL_ID,
          {
            color: '#00FF00',
            title: '음악 중지',
            description: '🎵 음악 재생을 중지했습니다.',
          },
        );
      }
    } catch (error) {
      this.logger.error('음악 중지 중 오류 발생:', error);
      await interaction.editReply(`❌ 오류: ${error.message}`);
    }
  }

  /**
   * 음성 채널을 가져오는 private 메서드
   */
  private getVoiceChannel(guild: Guild, channelId: string): VoiceChannel {
    const channel = guild.channels.cache.get(channelId) as VoiceChannel;
    if (!channel || !(channel instanceof VoiceChannel)) {
      throw new Error('음성 채널을 찾을 수 없습니다.');
    }
    return channel;
  }

  /**
   * 오디오 플레이어를 설정하는 private 메서드
   */
  private async setupAudioPlayer(videoUrl: string, voiceChannel: VoiceChannel) {
    try {
      const subprocess = ytdl.exec(videoUrl, {
        output: '-',
        extractAudio: true,
        audioFormat: 'mp3',
        noWarnings: true,
      });

      subprocess.stderr?.on('data', (data: Buffer) => {
        const errorMessage = data.toString();
        if (errorMessage.includes('HTTP Error 403: Forbidden')) {
          this.logger.error('YouTube API 요청 제한 발생');
          this.isPlaying = false;
          return;
        }
      });

      if (!subprocess.stdout) {
        throw new Error('YouTube 다운로드에 실패했습니다.');
      }

      const resource = createAudioResource(subprocess.stdout, {
        inputType: StreamType.Arbitrary,
      });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const audioPlayer = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });

      subprocess.on('error', (error) => {
        this.logger.error('YouTube 다운로드 중 오류 발생:', error);
        this.isPlaying = false;
        connection.destroy();
      });

      connection.subscribe(audioPlayer);
      audioPlayer.play(resource);

      return { audioPlayer, connection };
    } catch (error) {
      this.logger.error('오디오 플레이어 설정 중 오류 발생:', error);
      this.isPlaying = false;
      throw new Error(
        '음악 재생 준비에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  /**
   * 오디오 플레이어 이벤트를 처리하는 private 메서드
   */
  private handleAudioPlayerEvents(
    audioPlayer: AudioPlayer,
    connection: VoiceConnection,
    textChannel: TextChannel,
  ): void {
    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
      textChannel.send('🎵 음악 재생이 종료되었습니다.');
    });

    audioPlayer.on('error', (error) => {
      this.logger.error('음악 재생 중 오류 발생:', error);
      connection.destroy();
      textChannel.send('❌ 음악 재생 중 오류가 발생했습니다.');
    });
  }
}
