import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { SessionIoAdapter } from './websocket/session-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const uploadsPath = join(process.cwd(), 'uploads');

  mkdirSync(join(uploadsPath, 'covers'), {
    recursive: true,
  });

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  app.setGlobalPrefix('api');
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
    credentials: true,
  });
  const sessionMiddleware = session({
    name: 'library.sid',
    secret: configService.getOrThrow<string>('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.useWebSocketAdapter(
    new SessionIoAdapter(app, sessionMiddleware, frontendUrl),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(configService.get<number>('HTTP_PORT') ?? 3000);
}

void bootstrap();
