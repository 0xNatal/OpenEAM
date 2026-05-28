// Application entry point. Bootstraps the NestJS app, enables CORS for the web
// origin and graceful shutdown hooks, then starts the HTTP server.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

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
