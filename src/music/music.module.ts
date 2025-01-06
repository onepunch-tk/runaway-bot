import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}
