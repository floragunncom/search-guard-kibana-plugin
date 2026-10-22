---
name: kibana-version-bump
description: Bump the Search Guard Kibana plugin to a new Kibana version and prove it works. Use when asked to "bump to Kibana X.Y.Z", "upgrade to Kibana X.Y.Z", "update the Kibana version", or to fix the plugin after a Kibana bump (build, bootstrap, moon, pnpm, embeddable, basePath or login regressions). Covers the version edits, the local build against the real Kibana tag, the runtime smoke test against the official Kibana + Elasticsearch + Search Guard distributions, the known breakage hotspots, the commit layout and the CI follow-up.
---

# Kibana version bump for the Search Guard Kibana plugin

This skill moves the Search Guard Kibana plugin to a new Kibana release
(patch, minor or major) and proves the result works before CI runs. A run
ends with: the version edits, the plugin built and unit-tested against the
new Kibana tag, a runtime check of that build inside the official Kibana,
Elasticsearch and Search Guard distributions, one commit per fix for
anything that broke, and updated references for the next bump.

Most of the work is verification, because a green build proves little: the
plugin's tests mock Kibana core, so core API changes only surface when the
plugin runs inside a real Kibana. Running the full cycle locally is cheaper
than discovering the breakage in CI.

The procedure is version-independent. Take the old version from
`kibana.json` and the new one from the request. Version numbers in this file
are examples only. What broke in which release lives in `references/`
(breakage history, hotspots, baselines) and is history to check against,
not instructions.

Workflow at a glance:

1. Collect inputs and run `scripts/preflight.sh`.
2. Apply the version edits.
3. Diff the old and new Kibana tags on the paths that matter (`scripts/kibana_diff.sh`).
4. Build and unit-test the plugin inside a Kibana checkout at the new tag (`scripts/local_build.sh`), then run the static import check (`scripts/import_check.js`).
5. Run the plugin inside the official Kibana distribution against Elasticsearch + Search Guard (`scripts/runtime_setup.sh`, `scripts/runtime_check.sh`, `scripts/browser_check.sh`).
6. Run the four standard checks (section 6): imports, saved object indices / multitenancy storage, new log errors, new permissions.
7. On minor or major bumps, offer the optional upgrade migration check (section 7) and run it if the user agrees.
8. Fix what breaks, one commit per fix, "Bump to X.Y.Z" first.
9. Watch the first CI run; extend `references/breakage-history.md` and `references/baseline-<version>/` with anything new.

## 1. Inputs (ask once, up front)

| Input | Where it goes | Who knows it |
|---|---|---|
| Kibana version `X.Y.Z` | `kibana.json`, `package.json`, Kibana tag `vX.Y.Z` | the request |
| Search Guard ES plugin version (`SG_ES_PLUGIN`) | `.gitlab-ci-branch-specific.yml` | **only the user**. CI resolves `${SG_ES_PLUGIN}-es-${X.Y.Z}` from `maven.search-guard.com`. Do not guess; the previous version's value may not exist for the new Kibana. `preflight.sh` lists the releases that exist for `X.Y.Z`; when exactly one exists (9.5.5: only 4.2.0) it is the only value that can work, say so when asking. |
| Integration test branch (`IT_BRANCH`) | `.gitlab-ci-branch-specific.yml` | `X.Y.x`, changes on every minor bump |
| Run the upgrade migration check? (section 7) | optional, minor/major bumps | the user; also ask where the previous plugin zip comes from |

`scripts/preflight.sh X.Y.Z SG_VERSION` checks that the Kibana tag, the Kibana
and Elasticsearch tarballs and the Search Guard plugin zip all exist (HEAD
requests). The maven search API returns 404 anonymously; the direct zip URL is
the reliable check.

## 2. Version edits

- `kibana.json`: `"version": "X.Y.Z"`.
- `package.json`: `"version": "X.Y.Z-master-SNAPSHOT"`. The `-master-SNAPSHOT`
  suffix must stay; `build.sh` refuses non-SNAPSHOT versions.
- `.gitlab-ci-branch-specific.yml`: `IT_BRANCH: "X.Y.x"`, `SG_ES_PLUGIN: "<value>"`.
  Keep the double-quoted scalar style of the file.

Nothing else hard-codes the Kibana version: `.gitlab-ci.yml` derives
`SF_VERSION` from `kibana.json`, `build.sh` and `setup_test_instance.sh` from
`package.json`. `NODE_VERSION` in `.gitlab-ci.yml` is dead; Node comes from
Kibana's `.node-version` through `nvm install` in `ci/init_build.sh`.
`"version":"8.9.0"` strings in `template_auditlog.js` are Lens saved-object
schema versions, not the Kibana target.

Verify: `grep -rn 'OLD\.VERSION\|OLD\.MINOR\.x' --exclude-dir=node_modules --exclude-dir=kibana --exclude-dir=.git .` is empty and both JSON files still parse.

## 3. Read the Kibana diff before building

`scripts/kibana_diff.sh vOLD vNEW` (needs the `kibana/` checkout; missing tags
are fetched shallowly from GitHub) shows what changed between the two tags in
the parts this plugin depends on. Its scope is derived from the plugin, not
hard-coded, so it stays valid as the plugin evolves:

1. Toolchain and build tooling: Node, package manager, moon, plugin-helpers.
2. The Kibana plugins listed in `kibana.json` (required and optional): change
   volume per plugin, and the lines removed from their setup/start contract
   files. A removed method or export there is a to-do. A declared plugin that
   no longer exists in the new tag is flagged with `!!`.
3. Every `@kbn/*` package the sources import: change volume, and each named
   import that is no longer exported (`REMOVED since vOLD`). The authoritative
   check for exports is `import_check.js` after bootstrap (section 6a).
4. Every core service the code calls (`core.http`, `core.savedObjects`, ...):
   change volume of the matching `src/core/packages/<service>` directory.
5. Core server routes added since the old tag. The anonymous login page may
   call a new one; `AuthManager` must let it through or the plugin's 401
   handling must tolerate it (9.5: the feature-flag counter).
6. Known hotspots from `references/hotspots.tsv`: one line per place a past
   bump taught us to watch (path, optional pattern counted in both tags, with
   a `GONE` flag when the pattern disappeared). Add a line there whenever the
   breakage history gains a row; keep the script itself generic.
7. Release notes added between the tags, taken from `docs/release-notes/` in
   the Kibana repo: the versions covered, every breaking change and deprecation
   with its "Details" line, and release-note bullets that mention saved
   objects, security, sessions, spaces, basePath, dashboards, embeddables or
   `kibana.yml`.

**Read the release notes for every version between old and new**, not only
the target. The repo copy lags behind the releases, often by a whole minor,
so when section 7 does not list the newest minor, read the public pages
`https://www.elastic.co/docs/release-notes/kibana/breaking-changes`,
`.../deprecations` and `.../index` for the missing versions (WebFetch). Look
for: deprecated or removed `kibana.yml` settings the plugin documents or uses
(`elasticsearch.requestHeadersWhitelist`, cookie and session settings),
saved object or spaces changes (multitenancy), authentication and session
behaviour, dashboards and embeddable changes (the Watch status widget),
Node or package manager changes. Plugin-API breakages are usually not in the
user-facing notes; sections 2 to 5 cover those.

Read the output top to bottom and turn every removed contract line, removed
export, new route, `GONE` flag and relevant release note into a work item
before building. Section 3 checks imports from plugin entry points
(`@kbn/<x>-plugin/public|server|common`) against that entry's `index.ts` only:
a name that still exists somewhere in the plugin directory but is no longer
re-exported there is `undefined` at runtime (9.5: `ADD_PANEL_TRIGGER`, which
moved to `@kbn/ui-actions-plugin/common/trigger_ids`). Browser-only packages
cannot be verified by `import_check.js`; the dashboard browser pass is the proof. Details of past breakages are in
`references/breakage-history.md`.

## 4. Local build and unit tests

Mirror `ci/init_build.sh` exactly; it is the source of truth for the build
layout (Kibana cloned at `./kibana`, plugin copied to
`kibana/plugins/search-guard`). `scripts/local_build.sh X.Y.Z` does this:

- Node must match Kibana's `.node-version` exactly (Kibana's scripts validate
  it). Without nvm, download the tarball from nodejs.org into the scratchpad
  and put it on `PATH`.
- pnpm version comes from Kibana's `engines.pnpm`; `corepack` or
  `npm install -g pnpm@<version>` into that Node.
- Clone the tag with `--depth 1 --branch vX.Y.Z` into `kibana/` (untracked,
  never commit it), create the `main` ref, apply the optimizer `sed` patch,
  then `pnpm kbn bootstrap` (about 10 minutes, needs network).
- Copy the plugin directories listed in `ci/init_build.sh`, run
  `CI=true pnpm install --frozen-lockfile` in the plugin, run jest for
  `server` and `public` separately, then `pnpm install --prod --frozen-lockfile`
  and `node ../../scripts/plugin_helpers build -v X.Y.Z --skip-archive`,
  then move `node_modules` into `build/kibana/searchguard/`.

The sandbox may be aarch64: every script takes the architecture from
`uname -m`, and manual downloads must do the same (an x86_64 Node fails with a
"rosetta error"). Generating the lockfile inside the Kibana checkout leaves a
`.pnpm-store/` in the repo root; it is in `.gitignore` since 9.5.5.

If the lockfile is stale, regenerate it from inside
`kibana/plugins/search-guard` with the plugin's `pnpm-workspace.yaml` present
(it sets `nodeLinker: hoisted`, `autoInstallPeers: false`, `allowBuilds`).
pnpm 12 reads settings only from `pnpm-workspace.yaml`; `.npmrc`, `package.json`
and CLI flags are ignored. Check the generated lock says
`autoInstallPeers: false` and contains no `react`, `react-dom` or `webpack`
entries; those must come from Kibana.

## 5. Runtime smoke test (the step that finds the real regressions)

Run the plugin zip inside the official Kibana tarball against Elasticsearch
with the Search Guard plugin for the same version. Scripts, all parameterised
by a work directory `RT` (default: `<scratchpad>/rt`):

- `scripts/runtime_setup.sh X.Y.Z SG_VERSION <plugin-build-dir>`: downloads
  Elasticsearch, Kibana and the Search Guard plugin, installs the demo
  configuration, starts Elasticsearch, enables multitenancy via `sgctl special
  enable-mt`, adds a test tenant, installs the plugin zip into Kibana and
  starts Kibana. Idempotent per `RT`; re-run `scripts/kibana_restart.sh` after
  rebuilding the plugin.
- `scripts/runtime_check.sh`: HTTP checks with curl. Login page, auth config,
  `POST /api/v1/auth/login`, `authinfo`, `/api/status`, multitenancy info and
  tenant switch with a saved object that must be visible only in its tenant,
  bundle served, logout, and a grep of the Kibana log for `TypeError`,
  `[ERROR][plugins.searchguard]` and `[FATAL]`.
- `scripts/browser_check.sh [app paths...]`: drives the Kibana distribution's
  own headless Chromium with puppeteer-core through the login form and the
  Search Guard apps, printing every `pageerror`, `console.error`, failed
  request and 5xx. Expect zero.
- `scripts/user_check.sh [user] [password]` repeats the HTTP routes a normal
  session touches and the browser pass as a non-admin user (default: the demo
  user `kibanaro`, roles SGS_KIBANA_USER and SGS_READALL), and prints the
  Search Guard privilege blocks that user triggered. Run it after the admin
  passes and before `log_report.sh`; the admin passes alone never show which
  permissions regular Kibana users are missing.
- `scripts/runtime_stop.sh` stops both processes; `scripts/kibana_restart.sh <zip>`
  reinstalls a rebuilt plugin and restarts only Kibana.
- `scripts/browser_check.sh --dashboard <watchId>` additionally adds the
  Signals "Watch status" panel to a new dashboard, saves it and reloads it;
  `scripts/seed_watch.sh` creates a data view and a watch with a `severity`
  block first (the widget's selector only lists watches that have severity).
  The browser scripts classify output into page errors, Search Guard related
  problems, other, and known Kibana noise (resource 403/404s, CSP reports,
  elastic_assistant, cloud_connect, API key probes); the first two must be 0.

What "passes" means: Kibana logs `Kibana is now available`, no
`TypeError`/`ReferenceError` in the log, the login form appears (not a 500
and not a reload loop), login returns a cookie, `authinfo` shows the user,
tenant switching isolates saved objects, the browser pass reports zero
problems, and the dashboard pass reports the panel after reload. The one
accepted noise is `Could not check auth info` from `ReadOnlyMode` when a
request lacks a referer; the user chose to leave that alone.

Gotchas that cost time before:

- In ad-hoc shells `export SCRATCH=<scratchpad>` **before** `source common.sh`;
  the defaults (`RT`, `COOKIES`) are computed when the file is sourced, and a
  login then writes its cookie jar to `/tmp/sg-kibana-bump/rt/` (every later
  curl gets 401 "Session expired").
- `POST /api/core/capabilities` without a session answers 200 in 9.5 (Kibana
  serves default capabilities after the plugin's `notHandled`); anything but a
  500 is fine there.
- The dashboards REST API (`GET /api/dashboards/{id}`, technical preview since
  9.4) drops panels whose type has no registered schema and reports a
  `dropped_panel` warning for `watch_status_embeddable`; the dashboard UI still
  renders them from the saved object. Registering a panel schema is a follow-up
  for the plugin, not a bump regression. Use `/api/saved_objects/dashboard/{id}`
  (`panelsJSON`) to inspect what the plugin stored.

- Kibana internal routes refuse curl with `400 ... not available with the
  current configuration` unless you send `x-elastic-internal-origin: Kibana`.
- The demo installer is not executable in the zip; run it with `bash`. It also
  writes `network.host` and `cluster.initial_master_nodes` itself; the latter is
  rejected together with `discovery.type: single-node`, so the setup script
  strips those keys before appending its own.
- `bin/elasticsearch -d` exits non-zero when the node dies during boot; under
  `set -e` that aborts a script silently. Check `logs/<cluster>.log`.
- A fresh cluster has no data views, so the dashboard editor shows the "How do
  you want to explore your data?" screen without an "Add panel" button.
  `seed_watch.sh` creates one data view first.
- `/api/status` is redacted under Search Guard since Kibana 9.5: the full payload
  needs `cluster:monitor`, which Kibana checks through the X-Pack
  `_security/user/_has_privileges` API that Search Guard does not serve, so the
  check fails and Kibana answers the reduced form for every user (debug log
  "Failed to check 'monitor' cluster privilege"). `status.statusPageBypassMonitorPrivilege: true`
  restores the old behaviour. Take the build hash for bundle URLs from any app
  page instead (`/<hash>/bundles/...`).
- The Elasticsearch readiness loop must wait for `/_searchguard/health` to be
  green, not just for any HTTP answer (503 during Search Guard init).
- Enabling multitenancy through `PUT /_searchguard/config/frontend_multi_tenancy`
  is refused; use `sgctl special enable-mt`. Tenants are added with the bulk
  endpoint `PUT /_searchguard/config` using the admin certificate (kirk.pem).
- The headless Chromium shipped in Kibana needs NSS libraries. Playwright's
  Firefox under `~/.cache/ms-playwright/firefox-*/firefox` carries them; point
  `LD_LIBRARY_PATH` there. `browser_check.sh` does this.
- Signals watch summary is `POST /api/searchguard-signals/watch/summary` with
  body `{"query":{"size":500}}`.
- The dashboards public API is `/api/dashboards/{id}` with a flat body.
- The dashboard save modal does not open while the watch selector flyout is
  open; click its "Done" first.

## 6. The four standard checks (every bump, after the runtime test)

### 6a. Do all our `@kbn/*` imports still exist?

Babel only transpiles server code, so a named import that Kibana removed or
turned into a type-only export becomes `undefined` silently; nothing fails until
that code path runs (Kibana 9.5: `KibanaResponse` from `@kbn/core-http-server`,
used by `instanceof` in the auth code and Kerberos). Run, from the Kibana
checkout with Kibana's Node on `PATH`:

```bash
cd kibana && node ../.claude/skills/kibana-version-bump/scripts/import_check.js ..
```

It loads every imported package through Kibana's `setup_node_env` and prints
`MISSING <package> -> <name> (used in ...)` for named imports that resolve to
`undefined`. Must end with `IMPORT_CHECK_OK`. Packages it reports as
`UNVERIFIABLE` need a DOM (browser-only); those are covered by the optimizer
build and the browser pass. For anything missing, find the new home with
`git -C kibana grep -n "export .*<name>" vX.Y.Z` and read whether the contract
changed, not only the path.

### 6b. Did Kibana's saved object storage change under multitenancy?

Multitenancy relies on Kibana storing saved objects in `.kibana*` indices and
on the Search Guard ES plugin suffixing document ids with
`__sg_ten__<hash>_<tenant>` plus an `sg_tenant` field. The Kibana plugin itself
writes a default `space` document per tenant with a hand-copied structure
(`server/applications/multitenancy/spaces_service.js`) and talks to the index
alias from `core.savedObjects.getDefaultIndex()`.

- `scripts/kibana_diff.sh` covers the saved object index constants, the
  migrator and Kibana's `create_default_space.ts` through `hotspots.tsv`. A new
  index, a renamed alias, a different migration scheme or a changed space
  document all need a look at the plugin's tenant and spaces services and at
  the ES plugin.
- `scripts/so_index_check.sh` (after `runtime_check.sh`, needs the admin cert)
  lists the `.kibana*` indices and aliases, which types live where, the tenant
  documents, and diffs Kibana's own `space:default` against the tenant copy the
  plugin wrote. Expected: tenant docs exist with the suffix, and the only field
  difference is `sg_tenant`. Compare the output with
  `references/baseline-<previous version>/so-indices.md`.

### 6c. Any new errors in the Kibana log, at startup and during use?

`scripts/log_report.sh` (after `runtime_check.sh`, `browser_check.sh` and
`user_check.sh`, so that "during use" is covered) writes a normalised
inventory: every Kibana `[ERROR]` line with counts, the plugin's own WARN/ERROR
lines, `config.deprecation` warnings (a deprecated `kibana.yml` setting that the
plugin's docs or `docker/kibana.yml` still use must be changed), TypeErrors,
and the Search Guard sections below. Diff it against
`references/baseline-<previous version>/log-report.md`; anything new that
mentions searchguard, multitenancy, auth, saved objects or a 500 on a plugin
route is a regression until explained. Known accepted lines: the
`searchguard-readonly` "Could not check auth info" noise, the cookie
password/secure warnings of the demo config, and Kibana's own licence,
fleet, workflows and `[http] 500` entries that exist without the plugin too.
`runtime_setup.sh` enables the `http.server.response` debug logger, so the
report names the routes behind every 5xx: in 9.5.5 these were
`/internal/elastic_assistant/capabilities` (500) and
`/internal/cloud_connect/cluster_details` (503), both Kibana's own.

### 6d. Do the Kibana server or Kibana user roles need new permissions?

New Kibana versions call new Elasticsearch APIs and indices as the
`kibanaserver` user and as logged-in users. The admin passes only exercise
`SGS_ALL_ACCESS`; `user_check.sh` covers `SGS_KIBANA_USER` with the demo user
`kibanaro`, and more users can be passed if a customer role matters. Search Guard logs every failed
evaluation in the ES log as a block starting with `### No index privileges`
(or cluster/tenant) and ending with `Status: INSUFFICIENT`, naming the user,
roles, required privilege and the index. `scripts/log_report.sh` extracts those
blocks and additionally aggregates `MISSING_PRIVILEGES` events from the
`sg7-auditlog-*` index (secondary; denials on non-existing indices are not
audited). Report every distinct user / privilege / index triple to the user:
`SGS_KIBANA_SERVER` and `SGS_KIBANA_USER` are static roles of the Search Guard
ES plugin, so the fix lives there, not in this repo. Earlier findings are in
the permission table of `references/breakage-history.md` (9.5.5: `kibanaserver`
searching the non-existing `.fleet-actions` index at startup; `kibanaro` only
hits the plugin's own Signals and Auth Tokens actions).

## 7. Optional: upgrade migration check (ask the user)

Everything above runs on a fresh cluster. A minor or major Kibana bump also
migrates existing saved objects into new `.kibana*` indices, and tenant data
lives in those indices with Search Guard's id suffix. Whether that survives is
only proven by an upgrade. The check costs roughly one gigabyte of downloads
for the previous version and ten to fifteen minutes, so it is optional:

- **Ask before running it**, once, together with the inputs of section 1, on
  every minor or major bump. Patch bumps do not migrate; mention it only if
  the diff shows saved-objects or migrator changes.
- **Ask where the previous plugin zip comes from.** In this order of
  preference: a zip the user provides (`--old-zip PATH`); the published
  release `search-guard-flx-kibana-plugin-<OLD_SG>-es-<OLD>.zip` on
  `maven.search-guard.com` (the default, downloaded automatically); or a build
  of the previous bump commit of this repo against the previous Kibana tag.
  The last option needs a second Kibana checkout bootstrapped at the old tag
  and the old build tooling (yarn before 9.5.5), so it is the fallback when
  no release exists, for example when bumping from an unreleased state.

```bash
scripts/runtime_stop.sh                                   # both stacks use 9200 and 5601
scripts/migration_check.sh OLD NEW OLD_SG NEW_SG [--old-zip PATH] [--new-zip PATH]
```

What it does, in its own work directory `$SCRATCH/mig`: starts the previous
Elasticsearch, Search Guard, Kibana and plugin through `runtime_setup.sh`;
seeds dashboards and a visualization in the global tenant and the test tenant
(there is no private tenant any more; set `TEST_TENANT2` for a third one) plus
a Signals watch, and records the inventory and the per-tenant document counts; stops everything, starts the new Elasticsearch
with the new Search Guard plugin on the old data directory, then the new
Kibana with the new plugin zip, which runs the saved objects migration; and
finally compares. It passes when the migration log shows no errors, the
per-tenant counts are identical, every tenant document still carries the
`__sg_ten__` suffix, every seeded object is readable in its tenant and
invisible from the global tenant, and the watch is still readable. Phases can
be re-run separately with `--phase seed|upgrade|verify`. Compare the result
with `references/baseline-<previous version>/migration/`, which records what
the last migration looked like.

The script stops its own stack (`$SCRATCH/mig`) before phase 1; an aborted run
otherwise leaves Elasticsearch and Kibana running on 9200/5601, and the next run
silently talks to the old processes (red indices, 401 on login, "Port 5601 is
already in use"). If a run looks like that, `pkill -f "$SCRATCH/mig/"` and
check `ss -ltn` before retrying.

Store `$SCRATCH/mig/before` and `after` in `references/baseline-<version>/migration/`
when the check ran, and record a failure in the breakage history even if it
turns out to be a Search Guard ES plugin issue rather than ours.

## 8. Fixing regressions and committing

Fix in the plugin source (never only in the `kibana/plugins/search-guard`
copy), re-run the local build and the runtime checks. Look at
`examples/embeddable_examples` and the changed Kibana package for the
current contract rather than guessing.

Commit layout the user asked for:

1. `Bump to X.Y.Z`: the version edits plus everything that is not a
   behavioural fix (lockfile, CI scripts, README, build scripts).
2. One commit per regression fix with a message that names the Kibana
   version and the symptom, e.g.
   `Kibana 9.5: use basePath.serverBasePath instead of basePath.get()`.
3. CI-only fixes (moon, pnpm, cache) as their own commit on top.

Rules from the user's global instructions: no `Co-Authored-By` trailer,
no `git push` from the sandbox, make a backup branch before any destructive
git operation, quote YAML one-liners with single quotes. If the branch is a
detached HEAD, tell the user; do not create branches unasked.

## 9. CI follow-up

The first pipeline usually fails in `ci/init_build.sh`, not in the plugin.
Known failure signatures and where they are handled in that script:

- moon: `fatal: ambiguous argument 'main'` → the `refs/heads/main` block.
- moon: `Detected a shallow checkout while comparing against an explicit base`
  / `fatal: bad object <plugin-repo sha>` → `unset GITLAB_CI` before any moon
  invocation (both `pnpm kbn bootstrap` and `plugin_helpers build` run moon).
- `fatal: detected dubious ownership` → the `safe.directory` block.
- pnpm `ERR_PNPM_OUTDATED_LOCKFILE` → regenerate `pnpm-lock.yaml` (section 4).
- `ERR_PNPM_IGNORED_BUILDS` → add the package to `allowBuilds` in
  `pnpm-workspace.yaml`.
- Kibana changed its package manager or moon version → compare
  `packageManager`, `engines`, `@moonrepo/cli` in Kibana's `package.json`
  between the tags.

## 10. Close out, and keep this skill current

This skill is only as good as the last bump that updated it. While working,
keep a running list of every point where reality differed from the skill:

- a script failed or needed a manual workaround (an installer wrote a new
  setting, a URL or API moved, a selector changed in the browser flow);
- a check gave a result the skill did not explain (new log line, new index,
  new permission denial, an import reported missing);
- a regression that none of the known hotspots predicted;
- a step that turned out unnecessary, or an expectation in a script's output
  that was wrong.

At the end, do not just mention these in passing. Present a short "skill
update proposal" to the user: for each learning, which file would change
(`SKILL.md` section, `references/breakage-history.md` row,
`references/hotspots.tsv` line, `references/baseline-<version>/`, or a script)
and the one-line change. Apply
what the user accepts in the same session, as its own commit when the bump
commits are being made. Plain script bugs may be fixed immediately; still list
them so the user knows the skill changed.

Always, regardless of proposals:

- Append new regressions to `references/breakage-history.md` (what broke, the
  Kibana version, symptom, fix, how to detect it next time), new denials to
  its permission table, and a `references/hotspots.tsv` line for each new place
  worth watching.
- Store this bump's `log_report.sh` and `so_index_check.sh` output as
  `references/baseline-<version>/{log-report,so-indices}.md` for the next diff.
- Update the auto-memory file `sg-kibana-plugin-version-bump.md` if the
  procedure itself changed.
- Report: what was verified and how, what was left (log noise, skipped
  checks), the commit list, the skill update proposal, and that nothing was
  pushed.
