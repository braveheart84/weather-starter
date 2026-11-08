import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

describe('server API', () => {
  let app: Awaited<ReturnType<typeof import('./server.js').createApp>>;

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const { createApp } = await import('./server.js');
    app = await createApp({ serveFrontend: false, enableRequestLogging: false });
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
