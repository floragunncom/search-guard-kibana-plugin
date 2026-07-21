/*
 *    Copyright 2026 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  RequestTenantRegistry,
  extractRequestId,
  isReportingHttpPath,
  isReportingEsPath,
  installReportTenantInjection,
  DEFAULT_TTL_MS,
} from './report_tenant_injection';
import { setupLoggerMock, setupConfigMock } from '../../utils/mocks';

describe('extractRequestId', () => {
  it('returns the id as-is when there is no suffix', () => {
    expect(extractRequestId('01a2b3c4-d5e6')).toBe('01a2b3c4-d5e6');
  });

  it('strips the execution-context suffix', () => {
    expect(extractRequestId('01a2b3c4-d5e6;kibana:application:reporting:abc')).toBe(
      '01a2b3c4-d5e6'
    );
  });

  it('returns null for missing or empty values', () => {
    expect(extractRequestId(undefined)).toBeNull();
    expect(extractRequestId(null)).toBeNull();
    expect(extractRequestId('')).toBeNull();
    expect(extractRequestId(';kibana:task manager')).toBeNull();
    expect(extractRequestId(42)).toBeNull();
  });
});

describe('isReportingHttpPath', () => {
  it.each([
    '/internal/reporting/jobs/list',
    '/internal/reporting/jobs/count',
    '/internal/reporting/jobs/download/abc123',
    '/api/reporting/jobs/delete/abc123',
    '/api/reporting/generate/csv_searchsource',
  ])('matches %s', (path) => {
    expect(isReportingHttpPath(path)).toBe(true);
  });

  it.each([
    '/api/status',
    '/internal/security/me',
    '/api/reportingfoo/jobs/list',
    '/app/reporting',
    undefined,
  ])('does not match %s', (path) => {
    expect(isReportingHttpPath(path)).toBe(false);
  });
});

describe('isReportingEsPath', () => {
  it.each([
    '/.kibana-reporting/_doc/abc?op_type=create',
    '/.ds-.kibana-reporting-2026.07.21-000001/_doc/abc',
    '/.reporting-*%2C.kibana-reporting*/_search',
    '/.reporting-2020.01.01/_search',
  ])('matches %s', (path) => {
    expect(isReportingEsPath(path)).toBe(true);
  });

  it.each(['/.kibana/_search', '/_search', '/my-reports/_search', undefined])(
    'does not match %s',
    (path) => {
      expect(isReportingEsPath(path)).toBe(false);
    }
  );
});

describe('RequestTenantRegistry', () => {
  it('stores and resolves a tenant by opaque id', () => {
    const registry = new RequestTenantRegistry();
    registry.set('req-1', 'tenantA');
    expect(registry.getByOpaqueId('req-1')).toBe('tenantA');
    expect(registry.getByOpaqueId('req-1;kibana:application:reporting')).toBe('tenantA');
  });

  it('returns null for unknown ids', () => {
    const registry = new RequestTenantRegistry();
    expect(registry.getByOpaqueId('unknown')).toBeNull();
  });

  it('ignores entries without id or tenant', () => {
    const registry = new RequestTenantRegistry();
    registry.set('', 'tenantA');
    registry.set('req-1', '');
    registry.set('req-2', undefined);
    expect(registry.size).toBe(0);
  });

  it('expires entries after the TTL, also on read', () => {
    const registry = new RequestTenantRegistry({ ttlMs: 1000 });
    registry.set('req-1', 'tenantA', 0);
    expect(registry.getByOpaqueId('req-1', 999)).toBe('tenantA');
    expect(registry.getByOpaqueId('req-1', 1001)).toBeNull();
    expect(registry.size).toBe(0);
  });

  it('sweep removes only expired entries', () => {
    const registry = new RequestTenantRegistry({ ttlMs: 1000 });
    registry.set('old', 'tenantA', 0);
    registry.set('fresh', 'tenantB', 900);
    expect(registry.sweep(1500)).toBe(1);
    expect(registry.size).toBe(1);
    expect(registry.getByOpaqueId('fresh', 1500)).toBe('tenantB');
  });

  it('evicts the oldest entry at the size cap (FIFO)', () => {
    const registry = new RequestTenantRegistry({ maxEntries: 2 });
    registry.set('req-1', 'tenantA');
    registry.set('req-2', 'tenantB');
    registry.set('req-3', 'tenantC');
    expect(registry.size).toBe(2);
    expect(registry.getByOpaqueId('req-1')).toBeNull();
    expect(registry.getByOpaqueId('req-2')).toBe('tenantB');
    expect(registry.getByOpaqueId('req-3')).toBe('tenantC');
  });

  it('re-inserting refreshes the FIFO position', () => {
    const registry = new RequestTenantRegistry({ maxEntries: 2 });
    registry.set('req-1', 'tenantA');
    registry.set('req-2', 'tenantB');
    registry.set('req-1', 'tenantA'); // refresh
    registry.set('req-3', 'tenantC'); // evicts req-2, not req-1
    expect(registry.getByOpaqueId('req-1')).toBe('tenantA');
    expect(registry.getByOpaqueId('req-2')).toBeNull();
  });

  it('delete removes the entry', () => {
    const registry = new RequestTenantRegistry();
    registry.set('req-1', 'tenantA');
    registry.delete('req-1');
    expect(registry.getByOpaqueId('req-1')).toBeNull();
  });

  it('same-id same-tenant re-insert is a normal refresh', () => {
    const registry = new RequestTenantRegistry();
    expect(registry.set('req-1', 'tenantA')).toBe('stored');
    expect(registry.set('req-1', 'tenantA')).toBe('stored');
    expect(registry.getByOpaqueId('req-1')).toBe('tenantA');
  });

  it('same-id DIFFERENT-tenant collision drops both entries (fail closed)', () => {
    const registry = new RequestTenantRegistry();
    expect(registry.set('req-1', 'tenantA')).toBe('stored');
    expect(registry.set('req-1', 'tenantB')).toBe('collision');
    expect(registry.getByOpaqueId('req-1')).toBeNull();
    expect(registry.size).toBe(0);
  });

  it('an expired entry does not count as a collision', () => {
    const registry = new RequestTenantRegistry({ ttlMs: 1000 });
    registry.set('req-1', 'tenantA', 0);
    expect(registry.set('req-1', 'tenantB', 2000)).toBe('stored');
    expect(registry.getByOpaqueId('req-1', 2000)).toBe('tenantB');
  });
});

describe('installReportTenantInjection', () => {
  function setup({ injectionEnabled = true, mtEnabled = true, options = {} } = {}) {
    const hooks = { onPreAuth: null, onPreResponse: null, diagnostic: null };

    const kibanaCore = {
      http: {
        registerOnPreAuth: jest.fn((fn) => (hooks.onPreAuth = fn)),
        registerOnPreResponse: jest.fn((fn) => (hooks.onPreResponse = fn)),
      },
    };

    const elasticsearch = {
      client: {
        asInternalUser: {
          diagnostic: {
            on: jest.fn((event, fn) => (hooks.diagnostic = fn)),
          },
        },
      },
    };

    const configService = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.multitenancy.report_tenant_injection.enabled') {
          return injectionEnabled;
        }
        if (path === 'searchguard.multitenancy.enabled') return mtEnabled;
      }),
    });

    const logger = setupLoggerMock();

    const registry = installReportTenantInjection({
      kibanaCore,
      elasticsearch,
      configService,
      logger,
      options: { registerSweepTimer: false, ...options },
    });

    return { hooks, kibanaCore, elasticsearch, configService, logger, registry };
  }

  function httpRequest({ id = 'req-1', pathname = '/internal/reporting/jobs/list', sgtenant } = {}) {
    return {
      id,
      url: { pathname },
      headers: sgtenant === undefined ? {} : { sgtenant },
    };
  }

  function esCall({
    path = '/.reporting-*%2C.kibana-reporting*/_search',
    opaqueId = 'req-1;kibana:application',
    headers = {},
    method = 'POST',
  } = {}) {
    return {
      meta: {
        request: {
          params: { method, path, headers: { 'x-opaque-id': opaqueId, ...headers } },
          options: {},
        },
      },
    };
  }

  const toolkit = { next: jest.fn(() => 'next') };

  it('does nothing when the feature is disabled', () => {
    const { registry, kibanaCore, elasticsearch } = setup({ injectionEnabled: false });
    expect(registry).toBeNull();
    expect(kibanaCore.http.registerOnPreAuth).not.toHaveBeenCalled();
    expect(elasticsearch.client.asInternalUser.diagnostic.on).not.toHaveBeenCalled();
  });

  it('captures the tenant for reporting HTTP requests and injects it on reporting ES calls', () => {
    const { hooks } = setup();

    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantA' }), {}, toolkit);

    const call = esCall({ opaqueId: 'req-1;kibana:application:reporting' });
    hooks.diagnostic(null, call);

    expect(call.meta.request.params.headers.sgtenant).toBe('tenantA');
  });

  it('injects on the create write path too', () => {
    const { hooks } = setup();

    hooks.onPreAuth(
      httpRequest({ id: 'req-9', pathname: '/api/reporting/generate/csv_searchsource', sgtenant: 'tenantB' }),
      {},
      toolkit
    );

    const call = esCall({
      path: '/.kibana-reporting/_doc/abc123?op_type=create',
      opaqueId: 'req-9',
      method: 'PUT',
    });
    hooks.diagnostic(null, call);

    expect(call.meta.request.params.headers.sgtenant).toBe('tenantB');
  });

  it('does not capture non-reporting HTTP requests', () => {
    const { hooks } = setup();

    hooks.onPreAuth(
      httpRequest({ id: 'req-1', pathname: '/api/saved_objects/_find', sgtenant: 'tenantA' }),
      {},
      toolkit
    );

    const call = esCall({ opaqueId: 'req-1' });
    hooks.diagnostic(null, call);

    expect(call.meta.request.params.headers.sgtenant).toBeUndefined();
  });

  it('does not capture without an sgtenant header (MT disabled => structural pass-through)', () => {
    const { hooks, registry } = setup();

    hooks.onPreAuth(httpRequest({ id: 'req-1' }), {}, toolkit);
    expect(registry.size).toBe(0);

    const call = esCall({ opaqueId: 'req-1' });
    hooks.diagnostic(null, call);
    expect(call.meta.request.params.headers.sgtenant).toBeUndefined();
  });

  it('does not touch non-reporting ES calls', () => {
    const { hooks } = setup();

    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantA' }), {}, toolkit);

    const call = esCall({ path: '/.kibana/_search', opaqueId: 'req-1' });
    hooks.diagnostic(null, call);

    expect(call.meta.request.params.headers.sgtenant).toBeUndefined();
  });

  it('never overwrites an existing sgtenant header', () => {
    const { hooks } = setup();

    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantA' }), {}, toolkit);

    const call = esCall({ opaqueId: 'req-1', headers: { sgtenant: 'alreadySet' } });
    hooks.diagnostic(null, call);

    expect(call.meta.request.params.headers.sgtenant).toBe('alreadySet');
  });

  it('stops injecting after the request completes (onPreResponse cleanup)', () => {
    const { hooks } = setup();

    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantA' }), {}, toolkit);
    hooks.onPreResponse({ id: 'req-1' }, {}, toolkit);

    const call = esCall({ opaqueId: 'req-1' });
    hooks.diagnostic(null, call);

    expect(call.meta.request.params.headers.sgtenant).toBeUndefined();
  });

  it('warns and stops injecting on a request id collision with differing tenants', () => {
    const { hooks, logger } = setup();

    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantA' }), {}, toolkit);
    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantB' }), {}, toolkit);

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toContain('collision');

    const call = esCall({ opaqueId: 'req-1' });
    hooks.diagnostic(null, call);
    expect(call.meta.request.params.headers.sgtenant).toBeUndefined();
  });

  it('warns (throttled) when a reporting ES call has no correlation while MT is enabled', () => {
    const { hooks, logger } = setup({ options: { warnIntervalMs: 0 } });

    hooks.diagnostic(null, esCall({ opaqueId: 'unknownId;kibana:task manager' }));

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toContain('without tenant correlation');
  });

  it('does not warn when MT is disabled', () => {
    const { hooks, logger } = setup({ mtEnabled: false, options: { warnIntervalMs: 0 } });

    hooks.diagnostic(null, esCall({ opaqueId: 'unknownId' }));

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('throttles repeated warnings', () => {
    const { hooks, logger } = setup({ options: { warnIntervalMs: 60000 } });

    hooks.diagnostic(null, esCall({ opaqueId: 'unknown-1' }));
    hooks.diagnostic(null, esCall({ opaqueId: 'unknown-2' }));
    hooks.diagnostic(null, esCall({ opaqueId: 'unknown-3' }));

    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('hooks always continue the lifecycle, even when they throw internally', () => {
    const { hooks, logger } = setup();

    const brokenRequest = {
      id: 'req-1',
      get url() {
        throw new Error('boom');
      },
      headers: {},
    };

    expect(hooks.onPreAuth(brokenRequest, {}, toolkit)).toBe('next');
    expect(logger.error).toHaveBeenCalled();
  });

  it('never throws out of the diagnostic handler', () => {
    const { hooks, logger } = setup();

    expect(() => hooks.diagnostic(null, null)).not.toThrow();
    expect(() => hooks.diagnostic(new Error('transport error'), null)).not.toThrow();
    // Errors inside the handler are logged, malformed events are ignored.
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('expired entries are not used for injection', () => {
    const { hooks, registry } = setup({ options: { ttlMs: 0 } });

    hooks.onPreAuth(httpRequest({ id: 'req-1', sgtenant: 'tenantA' }), {}, toolkit);
    expect(registry.size).toBe(1);

    // ttlMs=0: any elapsed time expires the entry
    const call = esCall({ opaqueId: 'req-1' });
    const later = Date.now() + 10;
    expect(registry.getByOpaqueId('req-1', later)).toBeNull();
  });

  it('uses default TTL/cap when no options are given', () => {
    const registry = new RequestTenantRegistry();
    expect(registry.ttlMs).toBe(DEFAULT_TTL_MS);
  });
});
