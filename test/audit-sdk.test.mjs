import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuditLogger } from '../dist/index.js';

test('preenche serviceName e timestamp automaticamente', async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(null, { status: 204 });
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const audit = createAuditLogger({
    serviceName: 'user-service',
    endpoint: 'http://audit.local/logs',
    fireAndForget: false,
  });

  await audit.log({
    action: 'UPDATE',
    resourceType: 'user',
    resourceId: '42',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, 'http://audit.local/logs');

  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.serviceName, 'user-service');
  assert.equal(body.action, 'UPDATE');
  assert.equal(body.resourceType, 'user');
  assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('nao derruba a aplicacao no fire-and-forget quando fetch falha', async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new Error('network down');
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const audit = createAuditLogger({
    serviceName: 'billing-service',
    endpoint: 'http://audit.local/logs',
    fireAndForget: true,
  });

  await assert.doesNotReject(async () => {
    await audit.log({
      action: 'CREATE',
      resourceType: 'invoice',
      resourceId: 'inv-1',
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});

test('valida parametros obrigatorios', () => {
  assert.throws(
    () =>
      createAuditLogger({
        serviceName: '   ',
        endpoint: 'http://audit.local/logs',
      }),
    /serviceName/
  );

  assert.throws(
    () =>
      createAuditLogger({
        serviceName: 'svc',
        endpoint: '   ',
      }),
    /endpoint/
  );
});
