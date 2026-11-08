import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from 'vitest';

describe('server API', () => {
  let app: Awaited<ReturnType<typeof import('./server.js').createApp>>;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-server-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';
    const { createApp } = await import('./server.js');
    app = await createApp({ serveFrontend: false, enableRequestLogging: false });
  }, 30_000);

  afterAll(async () => {
    const { closeDatabase } = await import('./db.js');
    closeDatabase();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('reports a healthy status', async () => {
    await request(app).get('/health').expect(200, { status: 'healthy' });
  });

  it('accepts frontend interaction events', async () => {
    await request(app)
      .post('/api/logs')
      .send({ event: 'weather.refresh', metadata: { source: 'button' }, page: '/weather' })
      .expect(204);
  });

  it('rejects missing or malformed frontend event names', async () => {
    await request(app).post('/api/logs').send({}).expect(422, { detail: 'event is required' });
    await request(app)
      .post('/api/logs')
      .send({ event: 'Weather Refresh' })
      .expect(422, { detail: 'event is required' });
  });
});
