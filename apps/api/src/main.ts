// Application entry point. Bootstraps the NestJS app, enables CORS for the web
// origin and graceful shutdown hooks, then starts the HTTP server.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    bodyParser: false,
  });

  // Default Express body limit (~100kb) is too small for a full data-exchange
  // import bundle; raise it explicitly.
  app.use(express.json({ limit: '5mb' }));

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.enableShutdownHooks();

  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');

  console.log(`OpenEAM API listening on http://localhost:${port}`);
}

void bootstrap();
