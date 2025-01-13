import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [MusicService],
  controllers: [MusicController],
  exports: [MusicService],
})
export class MusicModule {}
