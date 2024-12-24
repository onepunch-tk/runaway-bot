import { Module } from '@nestjs/common';
import { EmbedHandler } from './handlers/embed.handler';

@Module({
  providers: [EmbedHandler],
  exports: [EmbedHandler],
})
export class CommonModule {}
