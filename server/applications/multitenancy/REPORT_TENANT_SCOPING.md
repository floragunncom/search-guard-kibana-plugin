# Report tenant scoping (HTTP-layer block)

Tenant-scopes the Kibana Reporting management read endpoints under Search
Guard multitenancy, so the Reporting UI (list, count, info, download, delete)
only ever exposes reports belonging to the current tenant. Task: `t-g8se9v`.

## Why

Kibana Reporting stores and reads its report docs as the **internal user**
(`kibanaserver`), so its Elasticsearch calls carry no `sgtenant` header, and
`created_by` is always `false` under Search Guard (x-pack security's
`getCurrentUser` returns null). Reporting's own list filter
(`term { created_by: false }`) therefore matches **every** report — the
management UI leaks reports across tenants.

The one place with an unforgeable answer to "who is asking" is the HTTP
request: the MT lifecycle stamps `request.headers.sgtenant` at `onPreAuth`
after validating the tenant against the backend. So Search Guard intercepts
the reporting read routes at `onPostAuth` (`report_tenant_scoping.js`):

| endpoint | action |
|---|---|
| `GET /internal/reporting/jobs/list` | **block + serve** a tenant-scoped `ReportApiJSON[]` |
| `GET /internal/reporting/jobs/count` | **block + serve** the scoped count (text/plain) |
| `GET /internal/reporting/jobs/info/{docId}` | **guard**: scoped by-id lookup; miss → 404; hit → continue |
| `GET /{api,internal}/reporting/jobs/download/{docId}` | **guard**, then reporting streams the content itself |
| `DELETE /{api,internal}/reporting/jobs/delete/{docId}` | **guard**, then reporting runs its own delete/cleanup |

Guard semantics: "not in your tenant" is indistinguishable from "does not
exist" — always **404, never 403**. All failure paths fail **closed** (no
tenant on the request, undecryptable/unstamped docs, internal errors): the
hook never falls through to reporting's unscoped handler.

`POST .../generate/...` and all `schedule`/`scheduled` routes are untouched:
the tenant is baked (encrypted) into `payload.headers` at create, and
scheduled reporting 403s under Search Guard before anything persists.

## Decision table (MT state × header)

| state | behavior |
|---|---|
| MT enabled + `sgtenant` present | scope to that tenant |
| MT enabled + header absent | fail closed: empty list, count 0, 404 |
| MT disabled | pass through untouched (header is legitimately absent) |

The MT-enabled signal is dynamic: the lifecycle re-checks the backend per
request and maintains `searchguard.multitenancy.enabled` in the shared
`configService`; the hook reads that same value.

## Filter tiers (`report_tenant_filters.js`)

How a report's tenant is determined is a pluggable seam
(`searchguard.multitenancy.report_tenant_scoping.filter`):

- **`node_decrypt` (default, no backend support needed).** Every on-demand
  report doc carries its creating request's headers — including `sgtenant` —
  encrypted with `xpack.reporting.encryptionKey` in `payload.headers`. The
  filter decrypts each hit with the mirrored key and keeps current-tenant
  matches. Because the offset must apply to *filtered* results, pages are
  served by a point-in-time `search_after` scan (stable `_shard_doc`
  tiebreaker) that skips `page*size` matches and collects `size` matches,
  bounded by `max_scan_docs`. `count` is a scan-and-count (a `_count` has no
  documents to decrypt). The `ids` polling path (management UI job poller)
  skips the scan loop entirely.
- **`header_passthrough`** — the Search Guard ES backend filters the
  reporting indices by an `sgtenant` header that Search Guard attaches to its
  own ES call. Exact pagination/count. **Inert without backend support**
  (returns unscoped results!).
- **`term`** — the backend stamps a queryable `sg_tenant` field at index time
  but does not auto-filter; the filter adds a `term` clause. Exact
  pagination/count, no decrypt. **Inert without backend support** (matches
  nothing → fail closed).

Tenant comparison goes through one canonicalizer (`canonicalizeTenantName`):
named tenants compare literally; `''`/`global`/`SGS_GLOBAL_TENANT` all
canonicalize to `SGS_GLOBAL_TENANT`; `private` → `__user__` (the
private-tenant feature no longer exists — no per-user discrimination is
built, by decision); anything non-string (absent, repeated header) → `null`
= never matches.

## Configuration

```yaml
searchguard.multitenancy.report_tenant_scoping:
  enabled: true                  # default false (opt-in)
  filter: node_decrypt           # node_decrypt | header_passthrough | term
  reporting_encryption_key: "<mirror of xpack.reporting.encryptionKey>"
  max_scan_docs: 10000           # node_decrypt scan bound
```

For `node_decrypt`, `xpack.reporting.encryptionKey` **must be explicitly set**
in `kibana.yml` (if unset, reporting auto-generates a per-node key nobody can
mirror) and `reporting_encryption_key` must mirror it exactly.

**Startup self-test:** on install, the filter does an encrypt/decrypt
round-trip. If it fails (missing/unusable key), a FATAL error is logged and
**all guarded reporting read endpoints answer 503** until fixed — a silent
decrypt failure would be a silent isolation loss, and serving empty lists
would look like data loss instead of a config error.

## Known limitations / deliberate deviations

- **Key rotation is silent data invisibility.** The self-test catches a
  missing/broken key, not a mirrored key that differs from the one older
  reports were encrypted with. Undecryptable docs are dropped (fail closed)
  with a warn-level per-query count in the log — after a rotation, reports
  created under the old key are permanently invisible in the UI.
- **Count includes the space filter** (reporting's own `count` has no
  `space_id` clause while its `list` does). Deviation so the table count
  agrees with what the list can show. Applied in all filter modes.
- **Unstamped docs are invisible to everyone**: pre-existing reports,
  scheduled-report instances (they carry no `payload.headers` at all), and
  system-generated reports whose creating request had no `sgtenant`.
- **List responses have no `queue_time_ms`/`execution_time_ms`** — parity
  with reporting's own list, which requests the runtime fields but does not
  map them into the response (only `info` does).
- The block serves list/count without reporting's license/availability checks
  (`authorizedUserPreRouting`, `context.reporting`) — the request never
  reaches reporting's handler.
- `node_decrypt` `count`/full list pages are O(total reports) decrypts per
  call; fine at report volumes, bounded by `max_scan_docs` (a warn is logged
  when the bound truncates a scan).

## Testing

- Unit: `report_tenant_filters.test.js`, `report_tenant_scoping.test.js`
  (run with Node 24 from the plugin root):

  ```
  ../../node_modules/.bin/jest --config ./tests/jest.config.js \
    --roots '<rootDir>/plugins/search-guard-kibana-plugin/server' \
    --testPathPattern 'report_tenant'
  ```

- Manual E2E (two tenants A/B, MT enabled, feature enabled + key mirrored):
  1. Create a CSV report in tenant A.
  2. In A: report appears in the management list, count matches, info /
     download / delete work.
  3. In B: list is empty, count 0, `info`/`download`/`delete` of A's doc id
     → 404.
  4. A pre-existing/unstamped doc is invisible to both and 404s by id.
  5. At an ES proxy: reporting's own unscoped `_search` never fires for
     list/count — only Search Guard's scoped queries (PIT + search_after) do.
  6. Non-MT install (or MT disabled in the backend): reporting behaves
     completely stock.
