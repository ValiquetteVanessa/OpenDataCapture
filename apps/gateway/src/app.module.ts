import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { Layout } from './components/Layout';
import { RenderInterceptor } from './interceptors/render.interceptor';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RenderInterceptor({
        root: Layout
      })
    }
  ]
})
export class AppModule {}
