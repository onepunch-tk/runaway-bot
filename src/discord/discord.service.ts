import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    console.log('DiscordService is working');
  }
}
