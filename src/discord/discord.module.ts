import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { InteractionService } from './services/interaction.service';

@Module({
  providers: [MessageService, InteractionService],
  exports: [MessageService, InteractionService],
})
export class DiscordModule {}
