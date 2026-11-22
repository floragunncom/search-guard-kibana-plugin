# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Kibana platform plugin** (id `searchguard`) that adds authentication/session management, multi-tenancy, the Search Guard configuration GUI, alerting (Signals), and API auth tokens to a Search Guard–secured Elasticsearch cluster. It has both a **server** side (Node, Kibana HTTP routes) and a **public** side (browser, React/EUI).

The plugin version tracks a specific Kibana version — always read `version` from `kibana.json` rather than assuming (currently `9.5.6`; `package.json` carries the same version plus a `-master-SNAPSHOT` suffix). The plugin only builds/tests against a matching Kibana source tree.

## Critical: this plugin cannot build or test standalone

It must live inside a checked-out Kibana source tree at `plugins/search-guard`, because build tooling, jest, and module resolution all come from the host Kibana repo. `tests/jest.config.js` uses `rootDir: '../../..'` and `roots: ['<rootDir>/plugins/search-guard']`, and the scripts in `package.json` shell out to `../../scripts/*` (Kibana's scripts). Running `pnpm build`, `pnpm test:*`, or `pnpm kbn` directly from a bare checkout will not work.

`ci/init_build.sh` (invoked by `./build.sh`) automates the full flow:
1. Checks `pnpm-lock.yaml` with `ci/check_lockfile.sh`: every entry must come from the npm registry and have an integrity hash (exceptions: `ci/lockfile-exceptions.txt`).
2. Reads the target version from `kibana.json` and clones the matching Kibana release branch (`v<version>`) into `./kibana/` (cached via `kibana/.cached_version`).
3. `nvm install` (Node from Kibana's `.nvmrc`), then provisions the pnpm version that Kibana's `package.json` pins (`packageManager`, or `engines.pnpm` in 8.19.22) via `corepack enable` / `corepack prepare`, then `pnpm kbn bootstrap` in the Kibana repo. (For older, yarn-based Kibana trees the script still falls back to `yarn kbn bootstrap`.)
4. Copies plugin sources (`public/`, `server/`, `common/`, `tests/`, `__mocks__/`, config files incl. `.kibana-plugin-helpers.json`, `pnpm-lock.yaml` and `pnpm-workspace.yaml`) into `kibana/plugins/search-guard` and runs `pnpm install --frozen-lockfile` there.
5. Runs jest, then `pnpm run build`, installs the plugin's production deps into `build/kibana/searchguard` with `pnpm install --prod --frozen-lockfile` (plugin-helpers' own install is disabled via `skipInstallDependencies`: it runs pnpm with `--ignore-workspace`, which drops the settings in `pnpm-workspace.yaml` and fails with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`), and moves the result to `./build/` in the repo root.

Note the folder name inside Kibana is `search-guard` even though the plugin id is `searchguard`.

## Dependencies

The plugin's own dependencies are managed with **pnpm** (`pnpm-lock.yaml`); there is no `yarn.lock` and no yarn anymore. The plugin is not part of Kibana's pnpm workspace: `pnpm-workspace.yaml` makes the plugin folder its own workspace root, so `pnpm install` in the plugin folder installs only the plugin's dependencies, and `pnpm kbn bootstrap` does not install them.

`pnpm-workspace.yaml` also holds the supply chain settings: no install scripts run (`ignoreScripts`, `strictDepBuilds`, `allowBuilds`), versions younger than three days are not resolved (`minimumReleaseAge`), dependencies of dependencies must come from the registry (`blockExoticSubdeps`), and peer dependencies are not installed (react and webpack come from Kibana). If an install or `pnpm add` fails because of one of these, do not loosen the setting to get past it; ask first.

## Commands

Run these from **inside the Kibana tree** (`kibana/plugins/search-guard`) after bootstrap, unless noted:

- Build a distributable: `./build.sh` — run from repo root; requires `NVM_DIR` set and `mvn` installed. It clones/bootstraps Kibana as described above and leaves the plugin in `./build/`. (`README.md` and `setup_test_instance.sh` still pass an `install-local` argument; the current `build.sh` ignores all arguments.)
- Run browser (public) unit tests: `pnpm test:browser`
- Run server unit tests: `pnpm test:server`
- Run a single test file: `../../node_modules/.bin/jest --config ./tests/jest.config.js <path/to/file.test.js>`
- Dev server: `pnpm start --elasticsearch.hosts http://localhost:9220` — this is Kibana's own script, so run it from the **Kibana root**, not from the plugin dir. The plugin's own `pnpm dev` is `plugin-helpers dev` (builds the browser bundle; `--watch` to rebuild on change).
- Kibana's dependencies, after switching the Kibana version: `pnpm kbn bootstrap`
- The plugin's own dependencies, after a branch switch that changes them: `pnpm install`

Tests are Jest with the `@kbn/test/jest_node` preset. `test:browser` = everything except `server`; `test:server` = everything except `public`. Both clear the jest cache first. A `build/` folder inside the plugin folder (left by `pnpm build`) makes jest stop with `Duplicated files or mocks`; delete it before running tests. CI runs the same two invocations with `JEST_JUNIT_OUTPUT_FILE` set, producing `junit-public.xml` and `junit-server.xml` in the project root.

## Architecture

Both entry points follow the Kibana plugin lifecycle. **Lifecycle methods must not return a promise and must finish within 10s** — the code works around this by kicking off `(async () => { ... })()` blocks inside `setup`/`start` (see `server/serverPlugin.js`, `public/publicPlugin.js`).

Four sub-applications exist on both sides under `server/applications/` and `public/applications/`:

- **searchguard** — authentication (login, session cookie, auth types), the read-only mode capability switcher, and the configuration GUI (`public/applications/searchguard/configuration-react`). Server auth types live in `server/applications/searchguard/auth/types/`: `basicauth`, `jwt`, `kerberos`, `openid`, `saml` (plus `common`). `AuthManager` orchestrates them; sessions use a custom cookie wrapper (`session/CustomCookieWrapper.js`).
- **multitenancy** — true multi-tenancy over Kibana saved objects, backed by `TenantService` and `SpacesService`.
- **signals** — alerting/watcher UI and routes, including dashboard embeddables (`public/applications/signals/embeddables/watch_status`).
- **authtokens** — API auth token management.

The split is not perfectly symmetric: `public/applications/accountinfo/` is public-only, and `server/applications/searchguard/` additionally holds server-only areas (`authorization/`, `jwt/`, `system/`, `xff/`). Shared public UI lives in `public/applications/components/` and `public/applications/utils/`.

Shared/cross-cutting pieces:
- `common/config_service.js` — `ConfigService`, the config abstraction used on both sides. On the server it merges Kibana global config, ES client config, and the `searchguard` plugin config; on the browser it fetches config via the API.
- Server backends: `server/applications/searchguard/backend/searchguard.js` (`SearchGuardBackend`) and `configuration/backend/searchguard_configuration_backend.js` talk to the SG Elasticsearch API. Routes register a `searchGuard` route handler context exposing `sessionStorageFactory`, `authManager`, `configService`.
- `public/services/` — `ApiService`, `AccessControlService`, `UiConfigService`, `ChromeHelper`. The public side wraps `core.http` in `HttpWrapper` (`public/utils/httpWrapper.js`).

`kibana.json` declares optional deps (`spaces`, `security`, `home`, `embeddable`, `dashboard`) and required deps (`uiActions`, `presentationUtil`); config namespace is `searchguard`; `enabledOnAnonymousPages` is true (login pages).

## Conventions

- **License header is enforced by ESLint** (`@kbn/eslint/require-license-header`, error level). Every `.js/.ts/.tsx` file needs the Apache-2.0 floragunn header — see `.eslintrc.js` for the exact text. New files without it will fail lint.
- ESLint config extends `@elastic/eslint-config-kibana` and `plugin:@elastic/eui/recommended`. `no-console` is disabled.
- Test files are colocated as `*.test.js` next to the code they test.
- `tests/jest.config.js` maps a few imports to stubs in `__mocks__/`: `!!raw-loader!./worker.js`, `ui/chrome`, and any `.svg` import. Add new shims there rather than mocking per test.
- UI uses Elastic EUI + React; forms use Formik.

## Related directories

- `ci/` — GitLab CI scripts and job includes pulled in by `.gitlab-ci.yml`: `init_build.sh` (build), `deploy.sh` + `artifact_uri.sh` + `setup_gpg.sh` (release), `install_dependencies.sh`/`utils.sh` (shared helpers), `security-scan.yml` (Trivy + OWASP Dependency-Check), `frontend-int-tests.yml`, `mt_data_migration_tests.yml` with its `pre_mt_data_migration_tests.yml` setup job, `dind-mirror.yml`, and `backport/` (Python backport tooling).
- `docker/` — Dockerfiles and push scripts for building a Kibana image bundling the plugin (plus a demo variant).
- `common/patches/` — shell patches applied to the host Kibana source (e.g. ES version compatibility).
- `common/examples/watches` — example Signals watch definitions.
