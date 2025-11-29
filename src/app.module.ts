import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [CoreModule, ServicesModule],
})
export class AppModule {}
