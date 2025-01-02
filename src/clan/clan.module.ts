import { Module } from '@nestjs/common';
import { ClanService } from './clan.service';
import { ClanController } from './clan.controller';
import { EmbedServices } from '../common/services/embed.services';

@Module({
  providers: [ClanService, EmbedServices],
  controllers: [ClanController],
})
export class ClanModule {}
