# Breakage history of the Search Guard Kibana plugin per Kibana release

One row per thing that broke (or had to change) in a bump, newest first. "Detect" says
which check of the skill shows it; add a `hotspots.tsv` line for every new place to watch.

## 9.4.3 -> 9.5.5 (October 2026, Search Guard 4.2.0)

| Area | What broke | Symptom | Fix | Detect next time |
|---|---|---|---|---|
| Toolchain | Kibana switched from yarn 1 to pnpm 12.4.2 (moon 2.4.6, Node 24.21.0) | `yarn kbn bootstrap` no longer exists; `plugin_helpers build` copies `pnpm-lock.yaml` and runs `pnpm install --prod --ignore-workspace` in the build dir unless `.kibana-plugin-helpers.json` sets `skipInstallDependencies` | `pnpm-workspace.yaml` (`nodeLinker: hoisted`, `autoInstallPeers: false`), `pnpm-lock.yaml` generated inside `kibana/plugins/search-guard`, `.kibana-plugin-helpers.json`, `ci/init_build.sh` and `ci/install_dependencies.sh` on pnpm, `yarn.lock` removed | `preflight.sh` / `kibana_diff.sh` section 1 (packageManager) |
| Git | `fatal: detected dubious ownership in repository` on the Kibana checkout (seen locally on the virtiofs mount, same signature as the CI cache) | git refuses every command in `kibana/` | `git config --global --add safe.directory` before touching the checkout (CI script and locally) | `local_build.sh`/clone fails immediately |
| core.http | `basePath.get()` now returns `request.basePath` and needs the request (`base_path_service.ts` lost its WeakMap cache) | `TypeError: Cannot read properties of undefined (reading 'basePath')` wherever the plugin called `basePath.get()` without a request at setup time (7 server sites) | `core.http.basePath.serverBasePath`; inside a request handler `basePath.get(request)` (login URL with `authTypeId`) | hotspot "basePath.get implementation"; Kibana fails to initialise the plugin at startup |
| core.http | `KibanaResponse` from `@kbn/core-http-server` is a type-only export; the class lives in `@kbn/core-http-router-server-internal` | Babel keeps the import, the value is `undefined`, `new KibanaResponse(307, ...)` throws on the capabilities redirect of the login page (AuthManager, AuthType, Kerberos) | import it from `@kbn/core-http-router-server-internal` (already imported there for `ensureRawRequest`) | `import_check.js` (`MISSING @kbn/core-http-server -> KibanaResponse`) |
| embeddable | `embeddable.registerReactEmbeddableFactory` renamed to `registerEmbeddablePublicDefinition`; `EmbeddableFactory` type is `EmbeddablePublicDefinition` | call throws inside the plugin's try/catch, the Watch status panel type is never registered | rename | `kibana_diff.sh` section 2 does not show it (the setup contract moved into `react_embeddable_system`); hotspot line added; `browser_check.sh --dashboard` |
| presentation-publishing | `initializeUnsavedChanges` removed; `initializeStateApi({ uuid, parentApi, serializeState, anyStateChange$, getComparators, applySerializedState })` replaces it, `onReset(lastSaved)` became `applySerializedState(state)` | optimizer build still succeeds, the embeddable throws at build time in the dashboard | migrate; the api object must expose `anyStateChange$`, `serializeState`, `applySerializedState` | `kibana_diff.sh` section 3 (`REMOVED since vOLD: initializeUnsavedChanges`) |
| presentation-publishing | panel state is handed over flat (`initialState` is exactly what `serializeState()` returned, no `rawState` wrapper); the plugin wrapped everything in `{ rawState }` | title comparators never saw the title, panel config stored nested | serialize flat; `unwrapState()` keeps reading dashboards saved by the 9.4 plugin (`{ rawState: { watchId } }`) | dashboards API: `GET /api/dashboards/<id>` shows the panel `config` |
| presentationUtil / dashboard | `registerPanelPlacementSettings` removed; the plugin called `dashboard.registerDashboardPanelSettings`, which never existed (silently caught) | default panel size fell back to Kibana's default | `getPlacementHints: () => ({ width: 8, height: 8 })` on the embeddable definition | `kibana_diff.sh` section 2 (removed contract lines of presentationUtil) |
| uiActions | `uiActions.registerAction` and `addTriggerAction` removed from the service; only `registerActionAsync`, `attachAction`, `addTriggerActionAsync` remain | `registerAction is not a function` inside the plugin's try/catch, "Add Signals watch" missing from the Add panel flyout | `uiActions.addTriggerActionAsync(ADD_PANEL_TRIGGER, id, async () => action)` | `kibana_diff.sh` section 2 (removed `'registerAction'` from the contract type) |
| uiActions | `ADD_PANEL_TRIGGER` is no longer re-exported from `@kbn/ui-actions-plugin/public` (9.4 had `export { triggers }` there); it lives in `@kbn/ui-actions-plugin/common/trigger_ids` | import resolves to `undefined`, the action is attached to trigger `undefined`: "Add Signals watch" missing from the flyout although registration succeeded | import from `@kbn/ui-actions-plugin/common/trigger_ids` | `kibana_diff.sh` section 3 did NOT flag it (it counts exports anywhere in the plugin dir, not at the imported entry point); `browser_check.sh --dashboard` ("Add Signals watch" item present: false) |
| Login page | Kibana core now POSTs `/internal/feature-flags/{flag}/counter` (`authc: enabled`) from every page, including the unauthenticated login page; the plugin answers 401 with `sg_redirectTo` | the client interceptor `redirectOnSessionTimeout` only skipped `/login`, `/logout`, `/customerror`, so the login page (`/searchguard/login`) redirected to itself | skip the interceptor on `/searchguard/login` as well | `kibana_diff.sh` section 5 (new core routes), hotspot "Feature flag usage counter route"; `scripts/login_requests.js`-style probe shows the 401 + `sg_redirectTo` on the login page |
| /api/status | full payload needs `cluster:monitor`, checked through the X-Pack `_has_privileges` API that Search Guard does not serve | reduced payload for every user (200, fewer fields) | nothing in the plugin; `status.statusPageBypassMonitorPrivilege: true` restores the old behaviour | hotspot "Status route privilege check" |

### Permission denials seen in the 9.5.5 runtime test

| User / role | Privilege | Index | Verdict |
|---|---|---|---|
| kibanaro (SGS_KIBANA_USER, SGS_READALL) | `cluster:admin:searchguard:authtoken/_own/search`, `cluster:admin:searchguard:authtoken/info` | - | plugin's own Auth Tokens app for a user without that role; expected |
| kibanaro (SGS_KIBANA_USER, SGS_READALL) | `cluster:admin:searchguard:signals:summary/load` | - | plugin's own Signals summary for a user without that role; expected |
| kibanaserver (SGS_KIBANA_SERVER) | `indices:data/read/search` | `.fleet-actions` (non-existing, once at startup, `xpack.fleet.agents.enabled: false`) | Kibana core/fleet probes the index; harmless on a cluster without Fleet, but SGS_KIBANA_SERVER could get read access to `.fleet-actions` in the ES plugin |

No Kibana-core related denials for `SGS_KIBANA_USER`.

### Upgrade migration 9.4.3 -> 9.5.5 (migration_check.sh, published 4.1.2-es-9.4.3 plugin as the old side)

`MIGRATION_CHECK_OK`. Kibana 9.5.5 ran a *compatible* migration: the `.kibana*_9.4.3_001`
indices were kept and got the additional `.kibana*_9.5.5` aliases (no reindex), tenant doc
counts identical (4 in the test tenant), every seeded dashboard/visualization readable in its
tenant and invisible from the global tenant, the Signals watch readable, suffixes intact. See
`baseline-9.5.5/migration/`. Two runs before that were invalid because of the script itself
(see the skill update list of the 9.5.5 bump): leftover processes of an aborted run kept the
ports, and `wait_for_kibana` returned 1 on a clean log.

### Other 9.5.5 observations

- `GET /api/dashboards/{id}` (dashboards REST API) answers with a `dropped_panel` warning
  "Panel schema not available for panel type: watch_status_embeddable" and leaves the panel
  out of `panels`; the UI renders it. Follow-up for the plugin: register a panel schema.
- `POST /api/core/capabilities` without a session answers 200 (default capabilities).
- `[ERROR][http] 500 Server Error` lines come from `/internal/elastic_assistant/capabilities`;
  the 503 from `/internal/cloud_connect/cluster_details`. Not plugin routes.
- Panels saved by the 9.4 plugin (config `{ rawState: { watchId } }`) still render
  (verified with a saved object created through `/api/saved_objects/dashboard`).

### Saved objects (9.5.5, fresh cluster)

Indices `.kibana_9.5.5_001`, `_alerting_cases`, `_analytics`, `_ingest`, `_search_solution`,
`_security_solution`, `_task_manager`, `_usage_counters`, plus `.kibana_streams-000001`,
`.kibana_locks-000001`, `.kibana_change_history` data stream and the two
`.kibana-siem-rule-migrations-*` indices. Tenant docs keep the `__sg_ten__` suffix, the tenant
`space:default` copy differs from Kibana's only by `sg_tenant`. See `baseline-9.5.5/so-indices.md`.
