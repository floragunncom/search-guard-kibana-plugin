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

import { cryptoFactory } from '@kbn/reporting-server';
import {
  installReportTenantScoping,
  matchReportingReadRoute,
  parseListQuery,
} from './report_tenant_scoping';
import { setupLoggerMock } from '../../utils/mocks';

const TEST_KEY = 'sg-unit-test-encryption-key-0123456789';
const crypto = cryptoFactory(TEST_KEY);

let hitCounter = 0;

function makeHit({ tenant, headers, id } = {}) {
  hitCounter += 1;
  const encryptedHeaders =
    headers !== undefined ? headers : crypto.encryptSync({ sgtenant: tenant, authorization: 'Basic x' });
  return {
    _id: id || `report-${hitCounter}`,
    _index: '.ds-.kibana-reporting-2026.07.21-000001',
    sort: [1000 - hitCounter, hitCounter],
    _source: {
      jobtype: 'csv_searchsource',
      created_at: '2026-07-21T00:00:00.000Z',
      status: 'completed',
      space_id: 'default',
      payload: { title: `report ${hitCounter}`, ...(encryptedHeaders === null ? {} : { headers: encryptedHeaders }) },
      output: { content: 'a,b,c', size: 5 },
    },
  };
}

function createClientMock({ searchResponses = [] } = {}) {
  const search = jest.fn();
  for (const response of searchResponses) {
    search.mockResolvedValueOnce(response);
  }
  search.mockResolvedValue({ hits: { hits: [] } });
  return {
    search,
    openPointInTime: jest.fn().mockResolvedValue({ id: 'pit-1' }),
    closePointInTime: jest.fn().mockResolvedValue({ succeeded: true }),
    count: jest.fn().mockResolvedValue({ count: 0 }),
  };
}

const asBatch = (hits) => ({ hits: { hits } });

const NEXT = Symbol('next');
const NOT_FOUND = Symbol('notFound');

function createRequest({ method = 'get', path, query = '', headers = {} } = {}) {
  return {
    route: { method },
    url: new URL(`http://localhost${path}${query}`),
    headers,
  };
}

function setup({
  mtEnabled = true,
  scoping = {
    enabled: true,
    filter: 'node_decrypt',
    reporting_encryption_key: TEST_KEY,
    max_scan_docs: 10000,
  },
  client = createClientMock(),
  spacesService = null,
} = {}) {
  const values = {
    'searchguard.multitenancy.enabled': mtEnabled,
    'searchguard.multitenancy.report_tenant_scoping': scoping,
  };
  const configService = {
    get: jest.fn((path) => values[path]),
    set: jest.fn((path, value) => {
      values[path] = value;
    }),
  };

  const kibanaCore = { http: { registerOnPostAuth: jest.fn() } };
  const logger = setupLoggerMock();

  const handler = installReportTenantScoping({
    kibanaCore,
    elasticsearch: { client: { asInternalUser: client } },
    configService,
    logger,
    spacesService,
  });

  const response = {
    notFound: jest.fn(() => NOT_FOUND),
    customError: jest.fn((options) => ({ isCustomError: true, ...options })),
  };
  const toolkit = { next: jest.fn(() => NEXT) };

  const call = (request) => handler(request, response, toolkit);

  return { handler, call, kibanaCore, configService, logger, client, response, toolkit };
}

beforeEach(() => {
  hitCounter = 0;
});

describe('matchReportingReadRoute', () => {
  it.each([
    ['get', '/internal/reporting/jobs/list', { action: 'list' }],
    ['get', '/internal/reporting/jobs/count', { action: 'count' }],
    ['get', '/internal/reporting/jobs/info/abc123', { action: 'guard', docId: 'abc123' }],
    ['get', '/internal/reporting/jobs/download/abc123', { action: 'guard', docId: 'abc123' }],
    ['get', '/api/reporting/jobs/download/abc123', { action: 'guard', docId: 'abc123' }],
    ['delete', '/internal/reporting/jobs/delete/abc123', { action: 'guard', docId: 'abc123' }],
    ['delete', '/api/reporting/jobs/delete/abc123', { action: 'guard', docId: 'abc123' }],
  ])('matches %s %s', (method, path, expected) => {
    expect(matchReportingReadRoute(method, path)).toEqual(expected);
  });

  it.each([
    // generate and schedule/scheduled routes must stay untouched
    ['post', '/api/reporting/generate/csv_searchsource'],
    ['post', '/internal/reporting/generate/csv_searchsource'],
    ['post', '/internal/reporting/schedule/csv_searchsource'],
    ['get', '/internal/reporting/scheduled/list'],
    ['post', '/internal/reporting/scheduled/bulk_delete'],
    // wrong method
    ['get', '/api/reporting/jobs/delete/abc123'],
    ['delete', '/internal/reporting/jobs/download/abc123'],
    // deeper or incomplete paths are not the {docId} routes
    ['get', '/internal/reporting/jobs/info/abc123/extra'],
    ['get', '/internal/reporting/jobs/info/'],
    ['get', '/internal/reporting/jobs/info'],
    // no loose matching
    ['get', '/api/status'],
    ['get', '/app/reporting'],
    ['get', '/internal/reporting/jobs/listing'],
  ])('does not match %s %s', (method, path) => {
    expect(matchReportingReadRoute(method, path)).toBeNull();
  });

  it('url-decodes the doc id', () => {
    expect(matchReportingReadRoute('get', '/internal/reporting/jobs/info/a%20b')).toEqual({
      action: 'guard',
      docId: 'a b',
    });
  });
});

describe('parseListQuery', () => {
  it('parses page, size and ids with reporting parity', () => {
    const params = new URLSearchParams('page=2&size=25&ids=a,b,c');
    expect(parseListQuery(params)).toEqual({ page: 2, size: 25, jobIds: ['a', 'b', 'c'] });
  });

  it('applies the defaults and the size cap', () => {
    expect(parseListQuery(new URLSearchParams(''))).toEqual({ page: 0, size: 10, jobIds: null });
    expect(parseListQuery(new URLSearchParams('page=x&size=9999'))).toEqual({
      page: 0,
      size: 100,
      jobIds: null,
    });
  });
});

describe('installReportTenantScoping', () => {
  it('does not register anything when disabled', () => {
    const { handler, kibanaCore } = setup({ scoping: { enabled: false } });
    expect(handler).toBeNull();
    expect(kibanaCore.http.registerOnPostAuth).not.toHaveBeenCalled();
  });

  it('registers the onPostAuth hook when enabled', () => {
    const { handler, kibanaCore } = setup();
    expect(kibanaCore.http.registerOnPostAuth).toHaveBeenCalledWith(handler);
  });

  describe('pass-through', () => {
    it('ignores non-reporting requests', async () => {
      const { call, toolkit, client } = setup();
      await expect(
        call(createRequest({ path: '/api/saved_objects/_find', headers: { sgtenant: 'A' } }))
      ).resolves.toBe(NEXT);
      expect(toolkit.next).toHaveBeenCalled();
      expect(client.search).not.toHaveBeenCalled();
    });

    it('ignores the generate and schedule routes', async () => {
      const { call, client } = setup();
      await expect(
        call(
          createRequest({
            method: 'post',
            path: '/api/reporting/generate/csv_searchsource',
            headers: { sgtenant: 'A' },
          })
        )
      ).resolves.toBe(NEXT);
      await expect(
        call(createRequest({ path: '/internal/reporting/scheduled/list', headers: { sgtenant: 'A' } }))
      ).resolves.toBe(NEXT);
      expect(client.search).not.toHaveBeenCalled();
    });

    it('passes reporting requests through untouched when MT is disabled', async () => {
      const { call, client } = setup({ mtEnabled: false });
      await expect(
        call(createRequest({ path: '/internal/reporting/jobs/list' }))
      ).resolves.toBe(NEXT);
      await expect(
        call(createRequest({ path: '/internal/reporting/jobs/count' }))
      ).resolves.toBe(NEXT);
      await expect(
        call(createRequest({ path: '/internal/reporting/jobs/info/abc' }))
      ).resolves.toBe(NEXT);
      expect(client.search).not.toHaveBeenCalled();
    });

    it('honors the dynamic MT flag maintained by the lifecycle', async () => {
      const { call, configService } = setup({ mtEnabled: true });
      configService.set('searchguard.multitenancy.enabled', false);
      await expect(
        call(createRequest({ path: '/internal/reporting/jobs/list' }))
      ).resolves.toBe(NEXT);
    });
  });

  describe('list (block + serve)', () => {
    it('serves only the current tenant reports with payload.headers stripped', async () => {
      const client = createClientMock({
        searchResponses: [
          asBatch([
            makeHit({ tenant: 'A', id: 'mine-1' }),
            makeHit({ tenant: 'B', id: 'theirs' }),
            makeHit({ tenant: 'A', id: 'mine-2' }),
          ]),
        ],
      });
      const { call, toolkit } = setup({ client });

      const result = await call(
        createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: 'A' } })
      );

      expect(result.status).toBe(200);
      expect(result.options.headers).toEqual({ 'content-type': 'application/json' });
      expect(result.payload.map((job) => job.id)).toEqual(['mine-1', 'mine-2']);
      for (const job of result.payload) {
        expect(job.payload.headers).toBeUndefined();
        expect(job.output.content).toBeUndefined();
      }
      // reporting's own handler must never run
      expect(toolkit.next).not.toHaveBeenCalled();
    });

    it('passes the parsed paging and ids query through to the filter', async () => {
      const client = createClientMock({ searchResponses: [asBatch([])] });
      const { call } = setup({ client });

      await call(
        createRequest({
          path: '/internal/reporting/jobs/list',
          query: '?page=0&ids=id-1,id-2',
          headers: { sgtenant: 'A' },
        })
      );

      const body = client.search.mock.calls[0][0];
      expect(JSON.stringify(body.query)).toContain('"values":["id-1","id-2"]');
      expect(client.openPointInTime).not.toHaveBeenCalled();
    });

    it('serves an empty list when MT is enabled but no tenant is on the request (fail closed)', async () => {
      const { call, client } = setup();
      const result = await call(createRequest({ path: '/internal/reporting/jobs/list' }));
      expect(result.status).toBe(200);
      expect(result.payload).toEqual([]);
      expect(client.search).not.toHaveBeenCalled();
    });

    it('fails closed on a repeated sgtenant header', async () => {
      const { call, client } = setup();
      const result = await call(
        createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: ['A', 'B'] } })
      );
      expect(result.status).toBe(200);
      expect(result.payload).toEqual([]);
      expect(client.search).not.toHaveBeenCalled();
    });

    it('scopes the empty-string header to the global tenant', async () => {
      const client = createClientMock({
        searchResponses: [
          asBatch([
            makeHit({ tenant: 'SGS_GLOBAL_TENANT', id: 'global-1' }),
            makeHit({ tenant: 'A', id: 'named' }),
          ]),
        ],
      });
      const { call } = setup({ client });

      const result = await call(
        createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: '' } })
      );
      expect(result.payload.map((job) => job.id)).toEqual(['global-1']);
    });
  });

  describe('count (block + serve)', () => {
    it('serves the scan-and-count total as text/plain', async () => {
      const client = createClientMock({
        searchResponses: [
          asBatch([makeHit({ tenant: 'A' }), makeHit({ tenant: 'B' }), makeHit({ tenant: 'A' })]),
        ],
      });
      const { call, toolkit } = setup({ client });

      const result = await call(
        createRequest({ path: '/internal/reporting/jobs/count', headers: { sgtenant: 'A' } })
      );

      expect(result.status).toBe(200);
      expect(result.payload).toBe('2');
      expect(result.options.headers).toEqual({ 'content-type': 'text/plain' });
      expect(toolkit.next).not.toHaveBeenCalled();
    });

    it('serves 0 when no tenant is on the request (fail closed)', async () => {
      const { call, client } = setup();
      const result = await call(createRequest({ path: '/internal/reporting/jobs/count' }));
      expect(result.payload).toBe('0');
      expect(client.search).not.toHaveBeenCalled();
    });
  });

  describe('guard + continue (info, download, delete)', () => {
    it.each([
      ['get', '/internal/reporting/jobs/info/mine'],
      ['get', '/internal/reporting/jobs/download/mine'],
      ['get', '/api/reporting/jobs/download/mine'],
      ['delete', '/internal/reporting/jobs/delete/mine'],
      ['delete', '/api/reporting/jobs/delete/mine'],
    ])('continues to the reporting handler on a tenant hit: %s %s', async (method, path) => {
      const client = createClientMock({
        searchResponses: [asBatch([makeHit({ tenant: 'A', id: 'mine' })])],
      });
      const { call, toolkit } = setup({ client });

      await expect(call(createRequest({ method, path, headers: { sgtenant: 'A' } }))).resolves.toBe(
        NEXT
      );
      expect(toolkit.next).toHaveBeenCalled();
    });

    it('returns 404 (never 403) for a report in another tenant', async () => {
      const client = createClientMock({
        searchResponses: [asBatch([makeHit({ tenant: 'B', id: 'theirs' })])],
      });
      const { call, response, toolkit } = setup({ client });

      await expect(
        call(
          createRequest({ path: '/internal/reporting/jobs/download/theirs', headers: { sgtenant: 'A' } })
        )
      ).resolves.toBe(NOT_FOUND);
      expect(response.notFound).toHaveBeenCalled();
      expect(toolkit.next).not.toHaveBeenCalled();
    });

    it('returns 404 for missing, unstamped and undecryptable docs (fail closed)', async () => {
      const emptyClient = createClientMock();
      const { call: callMissing } = setup({ client: emptyClient });
      await expect(
        callMissing(
          createRequest({ path: '/internal/reporting/jobs/info/nope', headers: { sgtenant: 'A' } })
        )
      ).resolves.toBe(NOT_FOUND);

      for (const headers of [null, 'garbage']) {
        const client = createClientMock({
          searchResponses: [asBatch([makeHit({ headers, id: 'doc' })])],
        });
        const { call } = setup({ client });
        await expect(
          call(createRequest({ path: '/internal/reporting/jobs/info/doc', headers: { sgtenant: 'A' } }))
        ).resolves.toBe(NOT_FOUND);
      }
    });

    it('returns 404 when MT is enabled but no tenant is on the request', async () => {
      const { call, client } = setup();
      await expect(
        call(createRequest({ method: 'delete', path: '/api/reporting/jobs/delete/doc' }))
      ).resolves.toBe(NOT_FOUND);
      expect(client.search).not.toHaveBeenCalled();
    });
  });

  describe('failure handling', () => {
    it('answers 503 on all guarded routes when the startup self-test failed', async () => {
      const { call, logger, response, toolkit } = setup({
        scoping: { enabled: true, filter: 'node_decrypt', reporting_encryption_key: null },
      });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('FATAL'));

      const result = await call(
        createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: 'A' } })
      );
      expect(result.isCustomError).toBe(true);
      expect(result.statusCode).toBe(503);
      expect(response.customError).toHaveBeenCalled();
      expect(toolkit.next).not.toHaveBeenCalled();

      // non-reporting traffic is unaffected
      await expect(call(createRequest({ path: '/api/status' }))).resolves.toBe(NEXT);
    });

    it('fails closed with a 500 on unexpected errors — never continues to reporting', async () => {
      const client = createClientMock();
      client.openPointInTime.mockRejectedValue(new Error('boom'));
      const { call, logger, toolkit } = setup({ client });

      const result = await call(
        createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: 'A' } })
      );

      expect(result.isCustomError).toBe(true);
      expect(result.statusCode).toBe(500);
      expect(toolkit.next).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('boom'));
    });
  });

  describe('space scoping', () => {
    it('uses the spaces service space id in the list query', async () => {
      const client = createClientMock({ searchResponses: [asBatch([])] });
      const spacesService = { getSpaceId: jest.fn(() => 'marketing') };
      const { call } = setup({ client, spacesService });

      await call(createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: 'A' } }));

      expect(spacesService.getSpaceId).toHaveBeenCalled();
      expect(JSON.stringify(client.search.mock.calls[0][0].query)).toContain('marketing');
    });

    it('falls back to the default space without a spaces service', async () => {
      const client = createClientMock({ searchResponses: [asBatch([])] });
      const { call } = setup({ client });

      await call(createRequest({ path: '/internal/reporting/jobs/list', headers: { sgtenant: 'A' } }));
      expect(JSON.stringify(client.search.mock.calls[0][0].query)).toContain('"space_id":"default"');
    });
  });
});
