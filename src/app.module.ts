import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from 'filters';
import { AuthGuard } from 'guards/auth.guard';
import { LoggerInterceptor } from 'interceptors/logger.interceptor';
import { CorrelationMiddleware } from 'middlewares';
import { ModuleContainerModule } from 'modules';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { WebClientModule } from 'shared/modules/web-client.module';
import { ApiConfigService } from 'shared/services/api-config.service';
import { SharedModule } from 'shared/shared.module';

import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    WebClientModule.forRootAsync({
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => ({
        baseURL: apiConfigService.apiConfig.baseUrl,
        timeout: 1000 * 60 * 3,
        maxRedirects: 5,
        timeoutErrorMessage: 'UPT Bff - Http Request timeout',
        withCredentials: true,
      }),
    }),
    I18nModule.forRootAsync({
      resolvers: [AcceptLanguageResolver],
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => ({
        fallbackLanguage: apiConfigService.fallbackLanguage,
        logging: apiConfigService.isDevelopment,
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: apiConfigService.isDevelopment,
        },
        viewEngine: 'ejs',
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 5, ttl: 60 }],
    }),
    SharedModule,
    ModuleContainerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
