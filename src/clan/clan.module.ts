import { Module } from '@nestjs/common';
import { ClanService } from './clan.service';
import { ClanController } from './clan.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [ClanService],
  controllers: [ClanController],
})
export class ClanModule {}
