import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { RequestHandler } from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import passport from 'passport';
import { Server, type ServerOptions } from 'socket.io';

type EngineNextFunction = (error?: Error) => void;

type EngineMiddleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: EngineNextFunction,
) => void;

interface EngineWithMiddleware {
  use(middleware: EngineMiddleware): void;
}

export class SessionIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly sessionMiddleware: RequestHandler,
    private readonly frontendUrl: string,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.frontendUrl,
        credentials: true,
      },
    }) as Server;
    this.useExpressMiddleware(server, this.sessionMiddleware);
    this.useExpressMiddleware(
      server,
      this.toRequestHandler(passport.initialize()),
    );
    this.useExpressMiddleware(
      server,
      this.toRequestHandler(passport.session()),
    );
    return server;
  }

  private toRequestHandler(middleware: unknown): RequestHandler {
    if (typeof middleware !== 'function') {
      throw new TypeError('Ожидался Express middleware');
    }
    return middleware as RequestHandler;
  }

  private useExpressMiddleware(
    server: Server,
    middleware: RequestHandler,
  ): void {
    const engine = server.engine as unknown as EngineWithMiddleware;
    const engineMiddleware = middleware as unknown as EngineMiddleware;
    engine.use(engineMiddleware);
  }
}
