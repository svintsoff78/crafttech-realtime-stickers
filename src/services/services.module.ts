import { Module } from '@nestjs/common';
import { StickersModule } from './stickers/stickers.module';

@Module({
  imports: [StickersModule],
})
export class ServicesModule {}
