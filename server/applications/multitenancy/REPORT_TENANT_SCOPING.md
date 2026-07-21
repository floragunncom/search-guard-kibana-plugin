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
| `GET /internal/reporting/jobs/list` | **block + serve**: 302 to `/api/v1/multitenancy/reporting/jobs/list`, which serves the tenant-scoped `ReportApiJSON[]` |
| `GET /internal/reporting/jobs/count` | **block + serve**: 302 to `/api/v1/multitenancy/reporting/jobs/count`, which serves the scoped count (text/plain) |
| `GET /internal/reporting/jobs/info/{docId}` | **guard**: scoped by-id lookup; miss → 404; hit → continue |
| `GET /{api,internal}/reporting/jobs/download/{docId}` | **guard**, then reporting streams the content itself |
| `DELETE /{api,internal}/reporting/jobs/delete/{docId}` | **guard**, then reporting runs its own delete/cleanup |

Why the redirect: hapi only accepts an **error**, a **takeover response**, or
a **continue signal** from lifecycle extensions that run before the route
handler, and core's `HapiResponseAdapter` applies `.takeover()` only to
redirects — a 2xx `KibanaResponse` returned from `onPostAuth` is rejected at
runtime with "Lifecycle methods called before the handler can only return an
error, a takeover response, or a continue signal". So the two 200-serving
endpoints redirect (the same supported mechanism the MT lifecycle uses for
its own redirects) to Search Guard-owned routes that serve the scoped
response as normal route handlers. The redirected request passes through the
full lifecycle again, so the MT lifecycle stamps `sgtenant` on it like on any
other `/api` request; the query string is forwarded as-is, and the browser /
`fetch` follows the 302 transparently. The guard 404s and the 5xx failure
responses are hapi errors and remain legal returns from the hook itself. The
scoped routes answer 404 if called directly while MT is disabled, and fail
closed (empty list / count 0) without a usable tenant header.

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

## Key rotation

Context — how stock Kibana handles `xpack.reporting.encryptionKey` rotation:
it doesn't. Reporting has no rotation machinery (unlike Encrypted Saved
Objects, which supports `xpack.encryptedSavedObjects.keyRotation.decryptionOnlyKeys`
plus a `_rotate_key` API). But stock reporting also barely needs one: it
decrypts `payload.headers` in exactly one place — at job **execution** time
(`run_report.ts`, via `decryptJobHeaders`). A key change therefore only
breaks **pending/unexecuted** jobs (error: "Failed to decrypt report job
data … re-generate this report"); completed reports remain listable and
downloadable forever, because their encrypted headers are never read again.

The `node_decrypt` filter changes that calculus: it decrypts on **every
read**, so after a rotation ALL pre-rotation reports become permanently
invisible (fail closed) — indistinguishable from deletion in the UI. The
startup self-test cannot catch this (it only proves the configured key is
usable, not that it matches what older docs were encrypted with); the only
signal is the warn-level per-query undecryptable count in the Kibana log.

Operator options after a rotation:

1. **Accept invisibility and re-generate** the reports that matter (matches
   stock Kibana's guidance for pending jobs). Current behavior.
2. *(Not implemented — candidate enhancement)* ESO-style
   `decryption_only_keys`: a config list of previous keys the filter tries
   in order after the primary. This would make rotation a non-event for
   reads and is the clean fix if rotations are expected.
3. *(Not implemented — explicitly NOT recommended as a default)* Treat
   undecryptable/unstamped ("older") reports as belonging to the **global
   tenant** so they remain reachable somewhere. ⚠️ This is a deliberate
   fail-OPEN policy: an undecryptable doc's tenant is *unknown*, not
   "global" — any tenant's reports (title, search params in `payload`, and
   downloadable content) would become visible to everyone with global-tenant
   access. If this is ever wanted, it must be a separate opt-in flag, off by
   default, and the decision recorded with the customer/operator. Note it
   also covers two distinct classes: undecryptable (rotation artifacts) and
   unstamped (no `payload.headers` at all — legacy docs, scheduled-report
   instances); a flag could reasonably treat them differently.

Whenever `xpack.reporting.encryptionKey` is rotated, rotate
`reporting_encryption_key` in the same change — a mismatch between the two
makes even *new* reports invisible.

## Known limitations / deliberate deviations
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
