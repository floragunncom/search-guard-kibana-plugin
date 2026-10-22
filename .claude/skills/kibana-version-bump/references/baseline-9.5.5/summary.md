# Kibana 9.5.5 bump of the Search Guard Kibana plugin (2026-10-22)

Bump from 9.4.3 to 9.5.5, verified at runtime and committed. Nothing was pushed.

## Inputs settled during the run

- `SG_ES_PLUGIN`: 4.2.0. The maven listing shows exactly one Search Guard release built for
  ES 9.5.x, so no other value can resolve. `IT_BRANCH`: 9.5.x.
- The optional upgrade migration check (SKILL.md section 7) was run without asking because
  the session was autonomous.
- The repo was a detached HEAD at the old tag; the five new commits sit on no branch.
  Create a branch from c1bec93 before checking anything else out.

## Commits (oldest first)

| SHA | Message | Content |
|---|---|---|
| 3055a29 | Bump to 9.5.5 | kibana.json, package.json, `.gitlab-ci-branch-specific.yml`; yarn to pnpm migration forced by Kibana 9.5: `pnpm-workspace.yaml`, generated `pnpm-lock.yaml`, `.kibana-plugin-helpers.json` (skipInstallDependencies), `yarn.lock` removed, `ci/init_build.sh` and `ci/install_dependencies.sh` on pnpm with `safe.directory` and `unset GITLAB_CI`, README and package scripts, `.pnpm-store/` ignored |
| a11c1b1 | Kibana 9.5: use basePath.serverBasePath instead of basePath.get() | `basePath.get()` now needs a request; seven server call sites use `serverBasePath`, the per-auth-type login URL uses `basePath.get(request)` |
| 9196b64 | Kibana 9.5: import KibanaResponse from @kbn/core-http-router-server-internal | `KibanaResponse` became a type-only export of `@kbn/core-http-server` (undefined at runtime) |
| e494d91 | Kibana 9.5: skip the session-timeout redirect on the login page | core POSTs `/internal/feature-flags/{flag}/counter` from the login page, answered 401 with `sg_redirectTo`; the interceptor now skips `/searchguard/login` |
| c1bec93 | Kibana 9.5: Watch status widget on the new embeddable, uiActions and presentation APIs | `registerEmbeddablePublicDefinition`, `addTriggerActionAsync`, `ADD_PANEL_TRIGGER` from `@kbn/ui-actions-plugin/common/trigger_ids`, `initializeStateApi`/`applySerializedState`, flat panel state with a fallback for panels saved by the 9.4 plugin, `getPlacementHints` |

## What was verified

- Unit tests against Kibana 9.5.5: server 82 passed (17 skipped), public 457 passed (5 skipped).
  `import_check.js`: 0 missing exports. Browser bundle built by `plugin_helpers`.
- Runtime in the official Kibana and Elasticsearch 9.5.5 distributions with Search Guard 4.2.0
  (demo config, multitenancy enabled, test tenant): login page, auth config, login, authinfo,
  `/api/status`, multitenancy info, tenant switch with a dashboard visible only in its tenant,
  bundle served, logout. Zero TypeError/ReferenceError/FATAL in the Kibana log.
- Browser passes (headless Chromium from the Kibana distribution) as admin through the
  configuration, Signals, auth tokens and dashboards apps, and as `kibanaro`: zero page errors,
  zero plugin problems (Forbidden errors for Signals/Auth Tokens as kibanaro are expected).
- Dashboard: "Add Signals watch" appears in the Add panel flyout, the Watch status panel
  renders, survives save and reload; a dashboard created with the 9.4 nested panel format
  (`{ rawState: { watchId } }`) still renders.
- Saved objects: tenant documents keep the `__sg_ten__` suffix; the tenant copy of
  `space:default` differs from Kibana's only by `sg_tenant`. See `so-indices.md`.
- Upgrade migration 9.4.3 to 9.5.5 with the published 4.1.2 plugin on the old side:
  compatible migration (old indices kept, new `.kibana*_9.5.5` aliases), tenant counts
  identical, every seeded object readable only in its tenant, Signals watch intact.
  See `migration/`.
- Log report (`log-report.md`): the 500s are `/internal/elastic_assistant/capabilities`,
  the 503 is `/internal/cloud_connect/cluster_details`, both Kibana's own.

## Left for the user

- Permission: `kibanaserver` (SGS_KIBANA_SERVER) searches the non-existing `.fleet-actions`
  index once at startup and is denied `indices:data/read/search`. Harmless on a cluster
  without Fleet; the fix would be in the ES plugin's static role.
- The dashboards REST API (`GET /api/dashboards/{id}`) drops panels without a registered
  schema and warns "Panel schema not available for panel type: watch_status_embeddable".
  The UI is unaffected. Registering a panel schema is a follow-up.
- `build.sh` (legacy local build script) is still yarn based and was left untouched.
- `POST /api/core/capabilities` without a session answers 200 (default capabilities); the
  check step title now accepts that.
- Remaining log noise is Kibana's own: elastic_assistant 500, cloud_connect 503, licence,
  workflows and securitySolution watchlist errors; plus the demo-config cookie warnings.

## Skill updates applied (untracked `.claude/` directory, not committed)

Script bugs fixed:
- `runtime_setup.sh` called `kibana_restart.sh` by a relative path after a `cd` (exit 127).
- `wait_for_kibana` in `common.sh` returned 1 on a clean log (no TypeErrors), which aborted
  `runtime_setup.sh` before `RUNTIME_SETUP_DONE` and made `migration_check.sh` think the old
  stack had failed.
- Downloads retry over HTTP/1.1 (`curl --http1.1 --retry 3`); maven over HTTP/2 broke once.
- `migration_check.sh` stops its own stack before phase 1 and aborts when the old stack does
  not come up; leftover processes of an aborted run had poisoned a rerun (red indices, 401
  on login, "Port 5601 is already in use").

Improvements:
- `runtime_setup.sh` enables the `http.server.response` debug logger; `log_report.sh` lists
  5xx responses per route so `[http] 500 Server Error` lines can be attributed.
- `kibana_diff.sh` section 3 checks imports from plugin entry points against that entry's
  `index.ts`; this would have caught `ADD_PANEL_TRIGGER`.
- `runtime_check.sh` step title for unauthenticated capabilities accepts 200.

References:
- `references/breakage-history.md` created: every 9.5 row, permission table, migration
  result, other observations.
- `references/hotspots.tsv`: six lines added (embeddable registration, presentation state
  api, ui_actions entry point and service methods, dashboard Add panel flyout, feature-flag
  authc route).
- `references/baseline-9.5.5/`: `log-report.md`, `so-indices.md`, `runtime-checks.md`,
  `kibana-diff-9.4.3-to-9.5.5.txt`, `migration/{before,after,migration-check.log}`.
- `SKILL.md`: notes on aarch64 downloads, exporting `SCRATCH` before sourcing `common.sh`,
  the capabilities 200, the dashboards API warning, the 5xx attribution, the migration
  stack cleanup, and the preflight release listing as the hint for `SG_ES_PLUGIN`.

## Environment facts worth keeping

- The sandbox is aarch64; x86_64 Node fails with a "rosetta error".
- `git` needed `safe.directory` for the `kibana/` checkout on this mount (same signature as
  the CI cache).
- Generating the lockfile inside `kibana/plugins/search-guard` left a `.pnpm-store/` in the
  repo root (now ignored).
- Session artifacts (Kibana log, screenshots, check outputs) were under
  `/tmp/claude-1000/-work/e01d240a-e02a-4942-a53e-f6dd0f1a83db/scratchpad`; both stacks
  were stopped at the end.
