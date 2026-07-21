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
  FILTER_MODES,
  HeaderPassthroughFilter,
  NodeDecryptFilter,
  TermFilter,
  canonicalizeTenantName,
  createTenantReportFilter,
  hitToApiJSON,
} from './report_tenant_filters';
import { setupLoggerMock } from '../../utils/mocks';

const TEST_KEY = 'sg-unit-test-encryption-key-0123456789';
const WRONG_KEY = 'a-completely-different-key-9876543210xx';
const crypto = cryptoFactory(TEST_KEY);

let hitCounter = 0;

/**
 * Build a reporting-index search hit. tenant: string to stamp (encrypted),
 * null for "no sgtenant in the headers". Pass headers to override the
 * encrypted blob entirely (e.g. garbage), or headers: null for a doc without
 * payload.headers at all (unstamped, like scheduled-report instances).
 */
function makeHit({ tenant, headers, id, sort } = {}) {
  hitCounter += 1;
  let encryptedHeaders;
  if (headers !== undefined) {
    encryptedHeaders = headers;
  } else {
    const headerObject = { authorization: 'Basic c2VjcmV0' };
    if (tenant !== null && tenant !== undefined) {
      headerObject.sgtenant = tenant;
    }
    encryptedHeaders = crypto.encryptSync(headerObject);
  }

  return {
    _id: id || `report-${hitCounter}`,
    _index: '.ds-.kibana-reporting-2026.07.21-000001',
    sort: sort || [Date.parse('2026-07-21T00:00:00Z') - hitCounter * 1000, hitCounter],
    _source: {
      jobtype: 'csv_searchsource',
      created_at: '2026-07-21T00:00:00.000Z',
      created_by: false,
      status: 'completed',
      attempts: 1,
      meta: { objectType: 'search' },
      space_id: 'default',
      payload: {
        title: `report ${hitCounter}`,
        ...(encryptedHeaders === null ? {} : { headers: encryptedHeaders }),
      },
      output: { content: 'a,b,c', size: 5, content_type: 'text/csv' },
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

function createDecryptFilter({ logger = setupLoggerMock(), ...rest } = {}) {
  return new NodeDecryptFilter({ encryptionKey: TEST_KEY, logger, ...rest });
}

beforeEach(() => {
  hitCounter = 0;
});

describe('canonicalizeTenantName', () => {
  it('keeps named tenants as-is', () => {
    expect(canonicalizeTenantName('Test')).toBe('Test');
    expect(canonicalizeTenantName('claude')).toBe('claude');
  });

  it('canonicalizes every known global-tenant encoding', () => {
    expect(canonicalizeTenantName('SGS_GLOBAL_TENANT')).toBe('SGS_GLOBAL_TENANT');
    expect(canonicalizeTenantName('sgs_global_tenant')).toBe('SGS_GLOBAL_TENANT');
    expect(canonicalizeTenantName('global')).toBe('SGS_GLOBAL_TENANT');
    expect(canonicalizeTenantName('Global')).toBe('SGS_GLOBAL_TENANT');
    // historic empty-string encoding of the global tenant
    expect(canonicalizeTenantName('')).toBe('SGS_GLOBAL_TENANT');
    expect(canonicalizeTenantName('  ')).toBe('SGS_GLOBAL_TENANT');
  });

  it('canonicalizes the private tenant but needs no special handling beyond that', () => {
    expect(canonicalizeTenantName('private')).toBe('__user__');
    expect(canonicalizeTenantName('__user__')).toBe('__user__');
  });

  it('returns null for anything that is not a string (fail closed)', () => {
    expect(canonicalizeTenantName(undefined)).toBeNull();
    expect(canonicalizeTenantName(null)).toBeNull();
    expect(canonicalizeTenantName(42)).toBeNull();
    // repeated header → array → not a usable tenant
    expect(canonicalizeTenantName(['Test', 'other'])).toBeNull();
  });
});

describe('hitToApiJSON', () => {
  it('maps a hit to the ReportApiJSON shape and strips payload.headers and output.content', () => {
    const hit = makeHit({ tenant: 'Test', id: 'report-x' });
    hit.fields = { queue_time_ms: [123], execution_time_ms: [456] };

    const json = hitToApiJSON(hit);

    expect(json.id).toBe('report-x');
    expect(json.index).toBe('.ds-.kibana-reporting-2026.07.21-000001');
    expect(json.jobtype).toBe('csv_searchsource');
    expect(json.payload.title).toBe('report 1');
    expect(json.payload.headers).toBeUndefined();
    expect(json.output.size).toBe(5);
    expect(json.output.content).toBeUndefined();
    expect(json.migration_version).toBe('7.14.0');
    // parity with reporting's list(): runtime fields are NOT passed through
    expect(json.queue_time_ms).toBeUndefined();
    expect(json.execution_time_ms).toBeUndefined();
  });

  it('passes runtime fields through only with includeFields', () => {
    const hit = makeHit({ tenant: 'Test' });
    hit.fields = { queue_time_ms: [123], execution_time_ms: [456] };

    const json = hitToApiJSON(hit, { includeFields: true });
    expect(json.queue_time_ms).toBe(123);
    expect(json.execution_time_ms).toBe(456);
  });

  it('applies the Report constructor defaults', () => {
    const json = hitToApiJSON({ _id: 'bare', _source: { payload: { title: 't' } } });
    expect(json.index).toBe('.kibana-reporting');
    expect(json.created_by).toBe(false);
    expect(json.meta).toEqual({ objectType: 'unknown' });
    expect(json.status).toBe('pending');
    expect(json.attempts).toBe(0);
    expect(json.output).toEqual({});
  });
});

describe('NodeDecryptFilter', () => {
  describe('selfTest', () => {
    it('passes with a usable key', () => {
      expect(() => createDecryptFilter().selfTest()).not.toThrow();
    });

    it('throws when the key is missing', () => {
      const filter = new NodeDecryptFilter({ encryptionKey: null, logger: setupLoggerMock() });
      expect(() => filter.selfTest()).toThrow(/reporting_encryption_key is not set/);
    });
  });

  describe('tenantFromHit', () => {
    it('decrypts the stamped tenant', () => {
      const filter = createDecryptFilter();
      const stats = filter.newStats();
      expect(filter.tenantFromHit(makeHit({ tenant: 'Test' }), stats)).toBe('Test');
      expect(stats).toEqual({ undecryptable: 0, unstamped: 0 });
    });

    it('canonicalizes global-tenant encodings from the doc', () => {
      const filter = createDecryptFilter();
      const stats = filter.newStats();
      expect(filter.tenantFromHit(makeHit({ tenant: 'SGS_GLOBAL_TENANT' }), stats)).toBe(
        'SGS_GLOBAL_TENANT'
      );
      expect(filter.tenantFromHit(makeHit({ tenant: '' }), stats)).toBe('SGS_GLOBAL_TENANT');
    });

    it('fails closed on docs without payload.headers', () => {
      const filter = createDecryptFilter();
      const stats = filter.newStats();
      expect(filter.tenantFromHit(makeHit({ headers: null }), stats)).toBeNull();
      expect(stats.unstamped).toBe(1);
    });

    it('fails closed on docs whose headers carry no tenant', () => {
      const filter = createDecryptFilter();
      const stats = filter.newStats();
      expect(filter.tenantFromHit(makeHit({ tenant: null }), stats)).toBeNull();
      expect(stats.unstamped).toBe(1);
    });

    it('fails closed on undecryptable docs (garbage)', () => {
      const filter = createDecryptFilter();
      const stats = filter.newStats();
      expect(filter.tenantFromHit(makeHit({ headers: 'not-an-encrypted-blob' }), stats)).toBeNull();
      expect(stats.undecryptable).toBe(1);
    });

    it('fails closed on docs encrypted with a different key (rotation)', () => {
      const wrongKeyBlob = cryptoFactory(WRONG_KEY).encryptSync({ sgtenant: 'Test' });
      const filter = createDecryptFilter();
      const stats = filter.newStats();
      expect(filter.tenantFromHit(makeHit({ headers: wrongKeyBlob }), stats)).toBeNull();
      expect(stats.undecryptable).toBe(1);
    });
  });

  describe('list (scan pagination)', () => {
    // 12 docs, tenants alternating A,B,A,B,... → A1..A6 are the matches.
    function alternatingHits() {
      return Array.from({ length: 12 }, (unused, i) =>
        makeHit({ tenant: i % 2 === 0 ? 'A' : 'B', id: `doc-${i + 1}` })
      );
    }

    it('serves page 0 by collecting matches from the top', async () => {
      const hits = alternatingHits();
      const client = createClientMock({
        searchResponses: [asBatch(hits.slice(0, 4)), asBatch(hits.slice(4, 8)), asBatch(hits.slice(8, 12))],
      });
      const filter = createDecryptFilter({ batchSize: 4 });

      const result = await filter.list({
        client,
        tenant: 'A',
        page: 0,
        size: 2,
        jobIds: null,
        spaceId: 'default',
      });

      expect(result.map((h) => h._id)).toEqual(['doc-1', 'doc-3']);
      // page filled from the first batch — no further scanning
      expect(client.search).toHaveBeenCalledTimes(1);
      expect(client.closePointInTime).toHaveBeenCalledWith({ id: 'pit-1' });
    });

    it('skips PAGE*SIZE matches (not raw docs) before collecting', async () => {
      const hits = alternatingHits();
      const client = createClientMock({
        searchResponses: [asBatch(hits.slice(0, 4)), asBatch(hits.slice(4, 8)), asBatch(hits.slice(8, 12))],
      });
      const filter = createDecryptFilter({ batchSize: 4 });

      const result = await filter.list({
        client,
        tenant: 'A',
        page: 1,
        size: 2,
        jobIds: null,
        spaceId: 'default',
      });

      // matches in order: doc-1, doc-3, doc-5, doc-7, ... skip 2 → doc-5, doc-7
      expect(result.map((h) => h._id)).toEqual(['doc-5', 'doc-7']);
    });

    it('iterates batches with search_after and a stable tiebreaker, omitting from', async () => {
      const hits = alternatingHits();
      const client = createClientMock({
        searchResponses: [asBatch(hits.slice(0, 4)), asBatch(hits.slice(4, 8)), asBatch(hits.slice(8, 12))],
      });
      const filter = createDecryptFilter({ batchSize: 4 });

      await filter.list({ client, tenant: 'A', page: 2, size: 2, jobIds: null, spaceId: 'default' });

      expect(client.openPointInTime).toHaveBeenCalledWith(
        expect.objectContaining({ index: '.reporting-*,.kibana-reporting*' })
      );

      const firstBody = client.search.mock.calls[0][0];
      expect(firstBody.from).toBeUndefined();
      expect(firstBody.search_after).toBeUndefined();
      expect(firstBody.pit).toEqual({ id: 'pit-1', keep_alive: '30s' });
      expect(firstBody.sort).toEqual([
        { created_at: { order: 'desc' } },
        { _shard_doc: 'desc' },
      ]);
      // node_decrypt must keep payload.headers in _source to decrypt it
      expect(firstBody._source).toEqual({ excludes: ['output.content'] });
      // the leak: no created_by clause anywhere
      expect(JSON.stringify(firstBody.query)).not.toContain('created_by');

      const secondBody = client.search.mock.calls[1][0];
      expect(secondBody.search_after).toEqual(hits[3].sort);
      const thirdBody = client.search.mock.calls[2][0];
      expect(thirdBody.search_after).toEqual(hits[7].sort);
    });

    it('excludes undecryptable and unstamped docs and warns about the undecryptable count', async () => {
      const logger = setupLoggerMock();
      const batch = [
        makeHit({ tenant: 'A', id: 'good-1' }),
        makeHit({ headers: 'garbage', id: 'garbage-1' }),
        makeHit({ headers: null, id: 'unstamped-1' }),
        makeHit({ tenant: 'A', id: 'good-2' }),
      ];
      const client = createClientMock({ searchResponses: [asBatch(batch)] });
      const filter = createDecryptFilter({ logger, batchSize: 4 });

      const result = await filter.list({
        client,
        tenant: 'A',
        page: 0,
        size: 10,
        jobIds: null,
        spaceId: 'default',
      });

      expect(result.map((h) => h._id)).toEqual(['good-1', 'good-2']);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('1 report doc(s) could not be decrypted'));
    });

    it('stops at the max_scan_docs bound and warns', async () => {
      const logger = setupLoggerMock();
      const endless = () => asBatch(Array.from({ length: 4 }, () => makeHit({ tenant: 'B' })));
      const client = createClientMock({
        searchResponses: [endless(), endless(), endless(), endless()],
      });
      const filter = createDecryptFilter({ logger, batchSize: 4, maxScanDocs: 6 });

      const result = await filter.list({
        client,
        tenant: 'A',
        page: 0,
        size: 5,
        jobIds: null,
        spaceId: 'default',
      });

      expect(result).toEqual([]);
      expect(client.search).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('max_scan_docs'));
    });

    it('short-circuits the scan loop when jobIds are present (poller hot path)', async () => {
      const batch = [
        makeHit({ tenant: 'A', id: 'mine' }),
        makeHit({ tenant: 'B', id: 'theirs' }),
      ];
      const client = createClientMock({ searchResponses: [asBatch(batch)] });
      const filter = createDecryptFilter();

      const result = await filter.list({
        client,
        tenant: 'A',
        page: 0,
        size: 10,
        jobIds: ['mine', 'theirs'],
        spaceId: 'default',
      });

      expect(result.map((h) => h._id)).toEqual(['mine']);
      expect(client.openPointInTime).not.toHaveBeenCalled();
      expect(client.search).toHaveBeenCalledTimes(1);

      const body = client.search.mock.calls[0][0];
      expect(body.index).toBe('.reporting-*,.kibana-reporting*');
      expect(body.from).toBeUndefined();
      expect(JSON.stringify(body.query)).toContain('"values":["mine","theirs"]');
    });

    it('returns empty for an unusable tenant without querying (fail closed)', async () => {
      const client = createClientMock();
      const filter = createDecryptFilter();

      expect(
        await filter.list({ client, tenant: null, page: 0, size: 10, jobIds: null, spaceId: 'default' })
      ).toEqual([]);
      expect(client.search).not.toHaveBeenCalled();
      expect(client.openPointInTime).not.toHaveBeenCalled();
    });

    it('treats missing indices (404) as empty results', async () => {
      const client = createClientMock();
      const notFound = new Error('index_not_found_exception');
      notFound.statusCode = 404;
      client.openPointInTime.mockRejectedValue(notFound);
      const filter = createDecryptFilter();

      expect(
        await filter.list({ client, tenant: 'A', page: 0, size: 10, jobIds: null, spaceId: 'default' })
      ).toEqual([]);
    });
  });

  describe('count (scan-and-count)', () => {
    it('counts all matches across batches, ignoring other tenants and broken docs', async () => {
      const batches = [
        asBatch([
          makeHit({ tenant: 'A' }),
          makeHit({ tenant: 'B' }),
          makeHit({ headers: 'garbage' }),
          makeHit({ tenant: 'A' }),
        ]),
        asBatch([
          makeHit({ tenant: 'A' }),
          makeHit({ headers: null }),
          makeHit({ tenant: 'B' }),
          makeHit({ tenant: 'A' }),
        ]),
      ];
      const client = createClientMock({ searchResponses: batches });
      const filter = createDecryptFilter({ batchSize: 4 });

      const total = await filter.count({ client, tenant: 'A', spaceId: 'default' });

      expect(total).toBe(4);
      // ran to exhaustion (2 full batches + the terminating empty batch)
      expect(client.search).toHaveBeenCalledTimes(3);
      expect(client.closePointInTime).toHaveBeenCalled();
    });

    it('includes the space clause (deliberate deviation from reporting count parity)', async () => {
      const client = createClientMock();
      const filter = createDecryptFilter();
      await filter.count({ client, tenant: 'A', spaceId: 'marketing' });
      expect(JSON.stringify(client.search.mock.calls[0][0].query)).toContain('marketing');
    });

    it('returns 0 for an unusable tenant', async () => {
      const client = createClientMock();
      const filter = createDecryptFilter();
      expect(await filter.count({ client, tenant: undefined, spaceId: 'default' })).toBe(0);
      expect(client.search).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('returns the hit when it belongs to the tenant', async () => {
      const hit = makeHit({ tenant: 'A', id: 'mine' });
      const client = createClientMock({ searchResponses: [asBatch([hit])] });
      const filter = createDecryptFilter();

      const result = await filter.getById({ client, tenant: 'A', docId: 'mine' });
      expect(result && result._id).toBe('mine');

      const body = client.search.mock.calls[0][0];
      // parity with reporting's get(): id term only, size 1, no space clause
      expect(JSON.stringify(body.query)).toContain('"_id":"mine"');
      expect(body.size).toBe(1);
      expect(JSON.stringify(body.query)).not.toContain('space_id');
    });

    it.each([
      ['another tenant', { tenant: 'B' }],
      ['an unstamped doc', { headers: null }],
      ['an undecryptable doc', { headers: 'garbage' }],
    ])('returns null for %s (fail closed)', async (label, hitOptions) => {
      const client = createClientMock({
        searchResponses: [asBatch([makeHit({ id: 'doc', ...hitOptions })])],
      });
      const filter = createDecryptFilter();
      expect(await filter.getById({ client, tenant: 'A', docId: 'doc' })).toBeNull();
    });

    it('returns null when nothing is found or the tenant is unusable', async () => {
      const client = createClientMock();
      const filter = createDecryptFilter();
      expect(await filter.getById({ client, tenant: 'A', docId: 'nope' })).toBeNull();
      expect(await filter.getById({ client, tenant: null, docId: 'doc' })).toBeNull();
      expect(await filter.getById({ client, tenant: 'A', docId: '' })).toBeNull();
    });

    it('matches the empty-string global encoding against the canonical global tenant', async () => {
      const client = createClientMock({
        searchResponses: [asBatch([makeHit({ tenant: '', id: 'global-doc' })])],
      });
      const filter = createDecryptFilter();
      const result = await filter.getById({
        client,
        tenant: 'SGS_GLOBAL_TENANT',
        docId: 'global-doc',
      });
      expect(result && result._id).toBe('global-doc');
    });
  });
});

describe('HeaderPassthroughFilter', () => {
  it('sends the sgtenant header on the ES call and keeps reporting from/size parity', async () => {
    const client = createClientMock({ searchResponses: [asBatch([makeHit({ tenant: 'A' })])] });
    const filter = new HeaderPassthroughFilter({ logger: setupLoggerMock() });

    await filter.list({ client, tenant: 'A', page: 2, size: 10, jobIds: null, spaceId: 'default' });

    const [body, options] = client.search.mock.calls[0];
    expect(options).toEqual({ headers: { sgtenant: 'A' } });
    expect(body.from).toBe(20);
    expect(body._source).toEqual({ excludes: ['output.content', 'payload.headers'] });
  });

  it('counts via _count with the sgtenant header', async () => {
    const client = createClientMock();
    client.count.mockResolvedValue({ count: 7 });
    const filter = new HeaderPassthroughFilter({ logger: setupLoggerMock() });

    expect(await filter.count({ client, tenant: 'A', spaceId: 'default' })).toBe(7);
    expect(client.count.mock.calls[0][1]).toEqual({ headers: { sgtenant: 'A' } });
  });
});

describe('TermFilter', () => {
  it('adds the sg_tenant term clause', async () => {
    const client = createClientMock();
    const filter = new TermFilter({ logger: setupLoggerMock() });

    await filter.list({ client, tenant: 'A', page: 0, size: 10, jobIds: null, spaceId: 'default' });
    expect(JSON.stringify(client.search.mock.calls[0][0].query)).toContain('"sg_tenant":"A"');

    await filter.getById({ client, tenant: 'A', docId: 'doc' });
    expect(JSON.stringify(client.search.mock.calls[1][0].query)).toContain('"sg_tenant":"A"');
  });

  it('counts via _count with the term clause', async () => {
    const client = createClientMock();
    client.count.mockResolvedValue({ count: 3 });
    const filter = new TermFilter({ logger: setupLoggerMock() });

    expect(await filter.count({ client, tenant: 'A', spaceId: 'default' })).toBe(3);
    expect(JSON.stringify(client.count.mock.calls[0][0].query)).toContain('"sg_tenant":"A"');
  });
});

describe('createTenantReportFilter', () => {
  it('creates the filter for each mode', () => {
    const logger = setupLoggerMock();
    expect(
      createTenantReportFilter({ mode: FILTER_MODES.NODE_DECRYPT, encryptionKey: TEST_KEY, logger })
    ).toBeInstanceOf(NodeDecryptFilter);
    expect(createTenantReportFilter({ mode: FILTER_MODES.HEADER_PASSTHROUGH, logger })).toBeInstanceOf(
      HeaderPassthroughFilter
    );
    expect(createTenantReportFilter({ mode: FILTER_MODES.TERM, logger })).toBeInstanceOf(TermFilter);
  });

  it('throws on unknown modes', () => {
    expect(() => createTenantReportFilter({ mode: 'nope', logger: setupLoggerMock() })).toThrow(
      /Unknown report tenant filter mode/
    );
  });
});
