// Health logic: runs a lightweight `SELECT 1` against the DB pool and reports
// overall status, DB reachability, and process uptime.
import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { DB_POOL } from '../db.module';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  db: 'up' | 'down';
  uptimeSeconds: number;
}

@Injectable()
export class HealthService {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async check(): Promise<HealthStatus> {
    let db: HealthStatus['db'] = 'down';
    try {
      const result = await this.pool.query('SELECT 1 AS ok');
      if (result.rows[0]?.ok === 1) {
        db = 'up';
      }
    } catch {
      db = 'down';
    }

    return {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
