# Report Tenant Injection

Tenant-scoping for Kibana Reporting under Search Guard multitenancy, by injecting the current
tenant as an `sgtenant` header onto Reporting's internal-user Elasticsearch calls.

- Module: `report_tenant_injection.js` (this directory)
- Config: `searchguard.multitenancy.report_tenant_injection.enabled` (default: `false`)
- Status: experimental — **inert without Search Guard ES backend support** (see
  [Backend contract](#backend-contract))

## The problem

Kibana Reporting persists, lists, downloads, and deletes its report documents using the shared
**internal-user** ES client (`asInternalUser` = `kibanaserver`):

- The create write (`PUT /.kibana-reporting/_doc/<id>?op_type=create`) carries no `sgtenant`
  header, so the backend cannot tell which tenant the report belongs to.
- The management UI's list/count queries run as `kibanaserver` with a
  `term { created_by: false }` filter (under Search Guard, x-pack security's `getCurrentUser`
  returns `null`, so `created_by` is `false` on **every** report). The filter matches everything:
  **every tenant sees every tenant's reports.**

Reporting's code cannot be changed (its route handlers and query factory are closed over at
plugin startup), and no supported Kibana API lets another plugin scope those calls.

## How it works

The originating HTTP request — where the validated tenant IS available — and the outgoing ES
call are correlated through the `x-opaque-id` header, which Kibana core stamps on **every**
internal-user ES call with the originating request's `request.id`.

```
 Browser ──HTTP──▶ Kibana
                     │
                     ├─ onPreAuth #1 (SG multitenancy lifecycle)
                     │    validates tenant, stamps request.headers.sgtenant
                     │
                     ├─ onPreAuth #2 (this module, registered after #1)          [CAPTURE]
                     │    reporting path? → registry[request.id] = sgtenant
                     │
                     ├─ ... route handler (Reporting) ...
                     │      └─ asInternalUser.search/index/delete
                     │           │  core stamps x-opaque-id = request.id
                     │           ▼
                     │      diagnostic('request') hook (this module)             [INJECT]
                     │        reporting index? no sgtenant yet?
                     │        → headers.sgtenant = registry[x-opaque-id prefix]
                     │           ▼
                     │        Elasticsearch (SG backend filters/stamps by header)
                     │
                     └─ onPreResponse (this module)                              [CLEANUP]
                          delete registry[request.id]
```

Three steps:

1. **Capture** (`registerOnPreAuth`, registered *after* the multitenancy lifecycle's hook —
   onPreAuth hooks run in registration order): for requests to `/api/reporting/*` or
   `/internal/reporting/*` that carry the SG-stamped `sgtenant` header, remember
   `request.id → tenant` in a bounded in-memory registry.
2. **Inject** (`asInternalUser.diagnostic('request')`): the diagnostic event fires synchronously
   before the transport serializes the request and shares the live `params` object, so setting
   `params.headers.sgtenant` reaches the wire. Only calls targeting the reporting indices
   (`.kibana-reporting`, `.ds-.kibana-reporting-*`, legacy `.reporting-*`) are touched, and only
   when they don't already carry an `sgtenant` header.
3. **Clean up** (`registerOnPreResponse` + TTL + size cap): see
   [Memory safety](#memory-safety).

### Why `x-opaque-id` is the correlation key

Kibana core's execution-context service stores the request id in an `AsyncLocalStorage` entered
at a raw synchronous Hapi `onRequest` extension, and the ES client transport copies it into the
`x-opaque-id` header of every ES call it can trace to a request
(`src/core/packages/elasticsearch/client-server-internal/src/create_transport.ts`). Core may
append an execution-context suffix after a semicolon
(`<request.id>;kibana:application:reporting:...`); the module uses the first segment.

This was verified on the wire (Kibana 9.4): the id is present on the reporting create write and
on the management UI's list `_search`. Plugins cannot use `AsyncLocalStorage` themselves for
this — every plugin-facing lifecycle hook is invoked through an awaited async adapter that
severs `enterWith` propagation — which is exactly why the correlation goes through a map keyed
by `request.id` instead.

## Security properties

- **The tenant value is trustworthy.** It is read from `request.headers.sgtenant` *after* the
  Search Guard multitenancy lifecycle validated the user's access to that tenant
  (`multitenancy_lifecycle.js`, `validateRequestedTenant`) and stamped the header server-side.
  Client-supplied `sgtenant` headers are validated by the same lifecycle before stamping.
- **Injection never overwrites.** A call that already carries `sgtenant` (e.g. Search Guard's
  own tenant-scoped calls) is left untouched.
- **Fail-closed by division of labor.** The Kibana side only *conveys* the tenant. If the
  registry has no entry (eviction, TTL, correlation loss), the call goes out **without** a
  tenant header and the backend must treat header-less reads as "no tenant → no results" while
  multitenancy is enabled. Kibana-side correlation loss then degrades to *reports temporarily
  invisible*, never to *reports visible across tenants*.
- **No credential exposure.** The module logs tenant names and ES paths at debug level only.
  It never reads or logs `authorization` headers or the encrypted `payload.headers`.
- **`server.requestId` must stay at its default.** By default `request.id` is a
  server-generated UUID and cannot be chosen by clients. If `server.requestId.allowFromAnyIp`
  is enabled (or trusted proxies forward `x-opaque-id`), clients can choose their own
  `request.id`; a deliberate collision with a concurrent request's id could mis-attribute a
  tenant. Do not enable those options on installations using this feature.

## Memory safety

The registry cannot grow without bound — three independent mechanisms:

1. **Deterministic delete**: `onPreResponse` removes the entry when the originating request
   finishes. In steady state the registry only contains in-flight reporting requests.
2. **TTL** (30 s, checked on read and by a sweep timer): covers requests that never complete
   (client disconnects, crashes mid-request). The sweep timer is `unref`ed and cannot keep the
   process alive.
3. **Hard size cap** (5000 entries, FIFO eviction): an absolute ceiling. Re-inserting an id
   refreshes its position so active requests aren't evicted first.

Entries are small (request id string + tenant string + timestamp); the ceiling is a few hundred
KB at worst.

## Backend contract

The Kibana side is one half. The Search Guard ES backend must:

1. **Filter reads by header** — `_search`/`_count`/get on the reporting indices with `sgtenant`
   return only that tenant's documents. **A read without the header (MT enabled) must return
   nothing** (fail closed; see Security properties).
2. **Stamp the document's tenant at create** from the header on the create write.
3. **Accept header-less updates** to already-stamped documents: report *execution* (status
   updates, content chunk writes) runs in Task Manager background tasks with no originating
   request (`x-opaque-id` = `unknownId;...task manager...`), so those calls cannot carry a
   tenant. They address existing documents by id.
4. **Pass everything through when multitenancy is disabled.**

## Limitations

- **Background/scheduled work carries no tenant.** Anything without an originating HTTP request
  (Task Manager, scheduled reports) cannot be correlated. On-demand reports are fine: the
  create write happens inside the generate HTTP request. Scheduled reporting needs its own
  design (it currently 403s under Search Guard before persistence).
- **Pre-existing reports have no tenant stamp.** Documents created before the backend stamping
  existed are header-less at rest; their visibility under filtering is a backend policy
  decision.
- **Depends on core's `x-opaque-id` stamping.** This is observed core behavior, not a public
  contract. If a Kibana upgrade stops stamping internal-user calls, injection silently stops —
  the failure mode is the throttled warning below plus empty report lists (fail closed at the
  backend), **not** a leak.

## Operations

Enable in `kibana.yml`:

```yaml
searchguard.multitenancy.report_tenant_injection.enabled: true
```

Log lines to know (logger: `searchguard-multitenancy`):

| Level | Message | Meaning |
|---|---|---|
| info | `Report tenant injection installed ...` | Feature active |
| debug | `injected tenant "<t>" on <method> <path>` | Working as intended |
| warn | `N reporting ES call(s) without tenant correlation ...` | Expected for background/task-manager calls. If the management UI shows no reports while MT is on, this is the first place to look: check that `x-opaque-id` stamping is intact and the registry isn't evicting under load. Throttled to one line per 30 s. |
| error | `asInternalUser.diagnostic unavailable ...` | Injection not installed — ES client API changed |

Wire verification (recommended after every Kibana upgrade): put an HTTP proxy in front of ES,
open the Reporting management UI in a tenant, and confirm the jobs `_search` carries
`sgtenant: <tenant>`; generate a report and confirm the create write does too.

## Reusing the pattern elsewhere

The mechanism is not reporting-specific. Any Kibana feature that performs internal-user ES
calls on behalf of an HTTP request can be covered the same way: capture per-request context at
a lifecycle hook keyed by `request.id`, correlate via `x-opaque-id` in the client diagnostic,
act on the outgoing call. To extend, generalize the two matchers
(`isReportingHttpPath`/`isReportingEsPath`) — the registry and hook wiring stay as they are.
The constraint to respect: only *convey* request context; enforcement belongs in the backend,
so that correlation loss fails closed.

## History / design references

Internal task references (Flugelschlagen): **t-ps8dqr** (this implementation), **t-mjqsfg**
(the investigation: wire captures, why AsyncLocalStorage and a security delegate don't work for
plugins, why the map survives), **t-g8se9v** (the alternative HTTP-layer block design, which
scopes reads Kibana-side without backend support), **t-vw5ay4** (PoC notes on reviving
AsyncLocalStorage via a raw Hapi extension).
