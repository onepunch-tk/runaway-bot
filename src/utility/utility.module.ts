import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [UtilityService],
  exports: [UtilityService],
})
export class UtilityModule {}
