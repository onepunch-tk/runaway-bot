import { Module } from '@nestjs/common';
import { EmbedServices } from './services/embed.services';

@Module({
  providers: [EmbedServices],
  exports: [EmbedServices],
})
export class CommonModule {}
