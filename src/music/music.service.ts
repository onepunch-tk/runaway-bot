import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { YOUTUBE_DATA_API_KEY } from '../common/constant/env.constant';
import { Client } from 'discord.js';

// 또는

@Injectable()
export class MusicService {
  private readonly youtube: youtube_v3.Youtube;

  constructor(private readonly configService: ConfigService) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: configService.get<string>(YOUTUBE_DATA_API_KEY),
    });

    // FFmpeg는 자동으로 처리됩니다
  }

  async test(client: Client) {}
}
