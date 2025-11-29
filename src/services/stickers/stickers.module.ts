import { Module } from '@nestjs/common';
import { StickersGateway } from './gateways/stickers.gateway';
import { StickersService } from './services/stickers.service';
import { WsValidationPipe } from '../../core/adapters/wsValidation.adapter';

@Module({
  providers: [StickersGateway, StickersService, WsValidationPipe],
})
export class StickersModule {}