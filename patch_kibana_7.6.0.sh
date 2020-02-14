#!/bin/bash

find_legacy_plugin_specs_ts=../../src/core/server/legacy/plugins/find_legacy_plugin_specs.ts
get_nav_links_test_ts=../../src/core/server/legacy/plugins/get_nav_links.test.ts
get_nav_links_ts=../../src/core/server/legacy/plugins/get_nav_links.ts
types_ts=../../src/core/server/legacy/types.ts

echo "Patch for Kibana 7.6.0 for "Multiple apps don\'t work anymore" bug: https://github.com/elastic/kibana/issues/57470"
echo "Solution code: https://github.com/elastic/kibana/pull/57542"

cat > $find_legacy_plugin_specs_ts <<EOF
/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Observable, merge, forkJoin } from 'rxjs';
import { toArray, tap, distinct, map } from 'rxjs/operators';

import {
  findPluginSpecs,
  defaultConfig,
  // @ts-ignore
} from '../../../../legacy/plugin_discovery/find_plugin_specs.js';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { collectUiExports as collectLegacyUiExports } from '../../../../legacy/ui/ui_exports/collect_ui_exports';

import { LoggerFactory } from '../../logging';
import { PackageInfo } from '../../config';
import { LegacyPluginSpec, LegacyPluginPack, LegacyConfig } from '../types';
import { getNavLinks } from './get_nav_links';

export async function findLegacyPluginSpecs(
  settings: unknown,
  loggerFactory: LoggerFactory,
  packageInfo: PackageInfo
) {
  const configToMutate: LegacyConfig = defaultConfig(settings);
  const {
    pack$,
    invalidDirectoryError$,
    invalidPackError$,
    otherError$,
    deprecation$,
    invalidVersionSpec$,
    spec$,
    disabledSpec$,
  }: {
    pack$: Observable<LegacyPluginPack>;
    invalidDirectoryError$: Observable<{ path: string }>;
    invalidPackError$: Observable<{ path: string }>;
    otherError$: Observable<unknown>;
    deprecation$: Observable<{ spec: LegacyPluginSpec; message: string }>;
    invalidVersionSpec$: Observable<LegacyPluginSpec>;
    spec$: Observable<LegacyPluginSpec>;
    disabledSpec$: Observable<LegacyPluginSpec>;
  } = findPluginSpecs(settings, configToMutate) as any;

  const logger = loggerFactory.get('legacy-plugins');

  const log$ = merge(
    pack$.pipe(
      tap(definition => {
        const path = definition.getPath();
        logger.debug(\`Found plugin at \${path}\`, { path });
      })
    ),

    invalidDirectoryError$.pipe(
      tap(error => {
        logger.warn(\`Unable to scan directory for plugins "\${error.path}"\`, {
          err: error,
          dir: error.path,
        });
      })
    ),

    invalidPackError$.pipe(
      tap(error => {
        logger.warn(\`Skipping non-plugin directory at \${error.path}\`, {
          path: error.path,
        });
      })
    ),

    otherError$.pipe(
      tap(error => {
        // rethrow unhandled errors, which will fail the server
        throw error;
      })
    ),

    invalidVersionSpec$.pipe(
      map(spec => {
        const name = spec.getId();
        const pluginVersion = spec.getExpectedKibanaVersion();
        const kibanaVersion = packageInfo.version;
        return \`Plugin "\${name}" was disabled because it expected Kibana version "\${pluginVersion}", and found "\${kibanaVersion}".\`;
      }),
      distinct(),
      tap(message => {
        logger.warn(message);
      })
    ),

    deprecation$.pipe(
      tap(({ spec, message }) => {
        const deprecationLogger = loggerFactory.get(
          'plugins',
          spec.getConfigPrefix(),
          'config',
          'deprecation'
        );
        deprecationLogger.warn(message);
      })
    )
  );

  const [disabledPluginSpecs, pluginSpecs] = await forkJoin(
    disabledSpec$.pipe(toArray()),
    spec$.pipe(toArray()),
    log$.pipe(toArray())
  ).toPromise();
  const uiExports = collectLegacyUiExports(pluginSpecs);
  const navLinks = getNavLinks(uiExports, pluginSpecs);

  return {
    disabledPluginSpecs,
    pluginSpecs,
    pluginExtendedConfig: configToMutate,
    uiExports,
    navLinks,
  };
}
EOF

cat > $get_nav_links_test_ts <<EOF
/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { LegacyUiExports, LegacyPluginSpec, LegacyAppSpec, LegacyNavLinkSpec } from '../types';
import { getNavLinks } from './get_nav_links';

const createLegacyExports = ({
  uiAppSpecs = [],
  navLinkSpecs = [],
}: {
  uiAppSpecs?: LegacyAppSpec[];
  navLinkSpecs?: LegacyNavLinkSpec[];
}): LegacyUiExports => ({
  uiAppSpecs,
  navLinkSpecs,
  injectedVarsReplacers: [],
  defaultInjectedVarProviders: [],
  savedObjectMappings: [],
  savedObjectSchemas: {},
  savedObjectMigrations: {},
  savedObjectValidations: {},
});

const createPluginSpecs = (...ids: string[]): LegacyPluginSpec[] =>
  ids.map(
    id =>
      ({
        getId: () => id,
      } as LegacyPluginSpec)
  );

describe('getNavLinks', () => {
  describe('generating from uiAppSpecs', () => {
    it('generates navlinks from legacy app specs', () => {
      const navlinks = getNavLinks(
        createLegacyExports({
          uiAppSpecs: [
            {
              id: 'app-a',
              title: 'AppA',
              pluginId: 'pluginA',
            },
            {
              id: 'app-b',
              title: 'AppB',
              pluginId: 'pluginA',
            },
          ],
        }),
        createPluginSpecs('pluginA')
      );

      expect(navlinks.length).toEqual(2);
      expect(navlinks[0]).toEqual(
        expect.objectContaining({
          id: 'app-a',
          title: 'AppA',
          url: '/app/app-a',
        })
      );
      expect(navlinks[1]).toEqual(
        expect.objectContaining({
          id: 'app-b',
          title: 'AppB',
          url: '/app/app-b',
        })
      );
    });

    it('uses the app id to generates the navlink id even if pluginId is specified', () => {
      const navlinks = getNavLinks(
        createLegacyExports({
          uiAppSpecs: [
            {
              id: 'app-a',
              title: 'AppA',
              pluginId: 'pluginA',
            },
            {
              id: 'app-b',
              title: 'AppB',
              pluginId: 'pluginA',
            },
          ],
        }),
        createPluginSpecs('pluginA')
      );

      expect(navlinks.length).toEqual(2);
      expect(navlinks[0].id).toEqual('app-a');
      expect(navlinks[1].id).toEqual('app-b');
    });

    it('throws if an app reference a missing plugin', () => {
      expect(() => {
        getNavLinks(
          createLegacyExports({
            uiAppSpecs: [
              {
                id: 'app-a',
                title: 'AppA',
                pluginId: 'notExistingPlugin',
              },
            ],
          }),
          createPluginSpecs('pluginA')
        );
      }).toThrowErrorMatchingInlineSnapshot(\`"Unknown plugin id \\\"notExistingPlugin\\\""\`);
    });

    it('uses all known properties of the navlink', () => {
      const navlinks = getNavLinks(
        createLegacyExports({
          uiAppSpecs: [
            {
              id: 'app-a',
              title: 'AppA',
              category: {
                label: 'My Category',
              },
              order: 42,
              url: '/some-custom-url',
              icon: 'fa-snowflake',
              euiIconType: 'euiIcon',
              linkToLastSubUrl: true,
              hidden: false,
            },
          ],
        }),
        []
      );
      expect(navlinks.length).toBe(1);
      expect(navlinks[0]).toEqual({
        id: 'app-a',
        title: 'AppA',
        category: {
          label: 'My Category',
        },
        order: 42,
        url: '/some-custom-url',
        icon: 'fa-snowflake',
        euiIconType: 'euiIcon',
        linkToLastSubUrl: true,
      });
    });
  });

  describe('generating from navLinkSpecs', () => {
    it('generates navlinks from legacy navLink specs', () => {
      const navlinks = getNavLinks(
        createLegacyExports({
          navLinkSpecs: [
            {
              id: 'link-a',
              title: 'AppA',
              url: '/some-custom-url',
            },
            {
              id: 'link-b',
              title: 'AppB',
              url: '/some-other-url',
              disableSubUrlTracking: true,
            },
          ],
        }),
        createPluginSpecs('pluginA')
      );

      expect(navlinks.length).toEqual(2);
      expect(navlinks[0]).toEqual(
        expect.objectContaining({
          id: 'link-a',
          title: 'AppA',
          url: '/some-custom-url',
          hidden: false,
          disabled: false,
        })
      );
      expect(navlinks[1]).toEqual(
        expect.objectContaining({
          id: 'link-b',
          title: 'AppB',
          url: '/some-other-url',
          disableSubUrlTracking: true,
        })
      );
    });

    it('only uses known properties to create the navlink', () => {
      const navlinks = getNavLinks(
        createLegacyExports({
          navLinkSpecs: [
            {
              id: 'link-a',
              title: 'AppA',
              category: {
                label: 'My Second Cat',
              },
              order: 72,
              url: '/some-other-custom',
              subUrlBase: '/some-other-custom/sub',
              disableSubUrlTracking: true,
              icon: 'fa-corn',
              euiIconType: 'euiIconBis',
              linkToLastSubUrl: false,
              hidden: false,
              tooltip: 'My other tooltip',
            },
          ],
        }),
        []
      );
      expect(navlinks.length).toBe(1);
      expect(navlinks[0]).toEqual({
        id: 'link-a',
        title: 'AppA',
        category: {
          label: 'My Second Cat',
        },
        order: 72,
        url: '/some-other-custom',
        subUrlBase: '/some-other-custom/sub',
        disableSubUrlTracking: true,
        icon: 'fa-corn',
        euiIconType: 'euiIconBis',
        linkToLastSubUrl: false,
        hidden: false,
        disabled: false,
        tooltip: 'My other tooltip',
      });
    });
  });

  describe('generating from both apps and navlinks', () => {
    const navlinks = getNavLinks(
      createLegacyExports({
        uiAppSpecs: [
          {
            id: 'app-a',
            title: 'AppA',
          },
          {
            id: 'app-b',
            title: 'AppB',
          },
        ],
        navLinkSpecs: [
          {
            id: 'link-a',
            title: 'AppA',
            url: '/some-custom-url',
          },
          {
            id: 'link-b',
            title: 'AppB',
            url: '/url-b',
            disableSubUrlTracking: true,
          },
        ],
      }),
      []
    );

    expect(navlinks.length).toBe(4);
    expect(navlinks).toMatchSnapshot();
  });
});
EOF

cat > $get_nav_links_ts <<EOF
/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  LegacyUiExports,
  LegacyNavLink,
  LegacyPluginSpec,
  LegacyNavLinkSpec,
  LegacyAppSpec,
} from '../types';

function legacyAppToNavLink(spec: LegacyAppSpec): LegacyNavLink {
  if (!spec.id) {
    throw new Error('Every app must specify an id');
  }
  return {
    id: spec.id,
    category: spec.category,
    title: spec.title ?? spec.id,
    order: typeof spec.order === 'number' ? spec.order : 0,
    icon: spec.icon,
    euiIconType: spec.euiIconType,
    url: spec.url || \`/app/\${spec.id}\`,
    linkToLastSubUrl: spec.linkToLastSubUrl ?? true,
  };
}

function legacyLinkToNavLink(spec: LegacyNavLinkSpec): LegacyNavLink {
  return {
    id: spec.id,
    category: spec.category,
    title: spec.title,
    order: typeof spec.order === 'number' ? spec.order : 0,
    url: spec.url,
    subUrlBase: spec.subUrlBase || spec.url,
    disableSubUrlTracking: spec.disableSubUrlTracking,
    icon: spec.icon,
    euiIconType: spec.euiIconType,
    linkToLastSubUrl: spec.linkToLastSubUrl ?? true,
    hidden: spec.hidden ?? false,
    disabled: spec.disabled ?? false,
    tooltip: spec.tooltip ?? '',
  };
}

function isHidden(app: LegacyAppSpec) {
  return app.listed === false || app.hidden === true;
}

export function getNavLinks(uiExports: LegacyUiExports, pluginSpecs: LegacyPluginSpec[]) {
  const navLinkSpecs = uiExports.navLinkSpecs || [];
  const appSpecs = (uiExports.uiAppSpecs || []).filter(
    app => app !== undefined && !isHidden(app)
  ) as LegacyAppSpec[];

  const pluginIds = (pluginSpecs || []).map(spec => spec.getId());
  appSpecs.forEach(spec => {
    if (spec.pluginId && !pluginIds.includes(spec.pluginId)) {
      throw new Error(\`Unknown plugin id "\${spec.pluginId}"\`);
    }
  });

  return [...navLinkSpecs.map(legacyLinkToNavLink), ...appSpecs.map(legacyAppToNavLink)].sort(
    (a, b) => a.order - b.order
  );
}
EOF

cat > $types_ts <<EOF
/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Server } from 'hapi';

import { ChromeNavLink } from '../../public';
import { KibanaRequest, LegacyRequest } from '../http';
import { InternalCoreSetup, InternalCoreStart } from '../internal_types';
import { PluginsServiceSetup, PluginsServiceStart } from '../plugins';
import { RenderingServiceSetup } from '../rendering';
import { SavedObjectsLegacyUiExports } from '../types';

/**
 * @internal
 * @deprecated
 */
export type LegacyVars = Record<string, any>;

type LegacyCoreSetup = InternalCoreSetup & {
  plugins: PluginsServiceSetup;
  rendering: RenderingServiceSetup;
};
type LegacyCoreStart = InternalCoreStart & { plugins: PluginsServiceStart };

/**
 * New platform representation of the legacy configuration (KibanaConfig)
 *
 * @internal
 * @deprecated
 */
export interface LegacyConfig {
  get<T>(key?: string): T;
  has(key: string): boolean;
  set(key: string, value: any): void;
  set(config: LegacyVars): void;
}

/**
 * Representation of a legacy configuration deprecation factory used for
 * legacy plugin deprecations.
 *
 * @internal
 * @deprecated
 */
export interface LegacyConfigDeprecationFactory {
  rename(oldKey: string, newKey: string): LegacyConfigDeprecation;
  unused(unusedKey: string): LegacyConfigDeprecation;
}

/**
 * Representation of a legacy configuration deprecation.
 *
 * @internal
 * @deprecated
 */
export type LegacyConfigDeprecation = (settings: LegacyVars, log: (msg: string) => void) => void;

/**
 * Representation of a legacy configuration deprecation provider.
 *
 * @internal
 * @deprecated
 */
export type LegacyConfigDeprecationProvider = (
  factory: LegacyConfigDeprecationFactory
) => LegacyConfigDeprecation[] | Promise<LegacyConfigDeprecation[]>;

/**
 * @internal
 * @deprecated
 */
export interface LegacyPluginPack {
  getPath(): string;
}

/**
 * @internal
 * @deprecated
 */
export interface LegacyPluginSpec {
  getId: () => unknown;
  getExpectedKibanaVersion: () => string;
  getConfigPrefix: () => string;
  getDeprecationsProvider: () => LegacyConfigDeprecationProvider | undefined;
}

/**
 * @internal
 * @deprecated
 */
export interface VarsProvider {
  fn: (server: Server, configValue: any) => LegacyVars;
  pluginSpec: {
    readConfigValue(config: any, key: string | string[]): any;
  };
}

/**
 * @internal
 * @deprecated
 */
export type VarsInjector = () => LegacyVars;

/**
 * @internal
 * @deprecated
 */
export type VarsReplacer = (
  vars: LegacyVars,
  request: LegacyRequest,
  server: Server
) => LegacyVars | Promise<LegacyVars>;

/**
 * @internal
 * @deprecated
 */
export type LegacyNavLinkSpec = Partial<LegacyNavLink> & {
  id: string;
  title: string;
  url: string;
};

/**
 * @internal
 * @deprecated
 */
export type LegacyAppSpec = Partial<LegacyNavLink> & {
  pluginId?: string;
  listed?: boolean;
};

/**
 * @internal
 * @deprecated
 */
export type LegacyNavLink = Omit<ChromeNavLink, 'baseUrl' | 'legacy' | 'order'> & {
  order: number;
};

/**
 * @internal
 * @deprecated
 */
export type LegacyUiExports = SavedObjectsLegacyUiExports & {
  defaultInjectedVarProviders?: VarsProvider[];
  injectedVarsReplacers?: VarsReplacer[];
  navLinkSpecs?: LegacyNavLinkSpec[] | null;
  uiAppSpecs?: Array<LegacyAppSpec | undefined>;
  unknown?: [{ pluginSpec: LegacyPluginSpec; type: unknown }];
};

/**
 * @public
 * @deprecated
 */
export interface LegacyServiceSetupDeps {
  core: LegacyCoreSetup;
  plugins: Record<string, unknown>;
}

/**
 * @public
 * @deprecated
 */
export interface LegacyServiceStartDeps {
  core: LegacyCoreStart;
  plugins: Record<string, unknown>;
}

/**
 * @internal
 * @deprecated
 */
export interface ILegacyInternals {
  /**
   * Inject UI app vars for a particular plugin
   */
  injectUiAppVars(id: string, injector: VarsInjector): void;

  /**
   * Get all the merged injected UI app vars for a particular plugin
   */
  getInjectedUiAppVars(id: string): Promise<LegacyVars>;

  /**
   * Get the metadata vars for a particular plugin
   */
  getVars(
    id: string,
    request: KibanaRequest | LegacyRequest,
    injected?: LegacyVars
  ): Promise<LegacyVars>;
}

/**
 * @internal
 * @deprecated
 */
export interface LegacyPlugins {
  disabledPluginSpecs: LegacyPluginSpec[];
  pluginSpecs: LegacyPluginSpec[];
  uiExports: LegacyUiExports;
  navLinks: LegacyNavLink[];
}

/**
 * @internal
 * @deprecated
 */
export interface LegacyServiceDiscoverPlugins extends LegacyPlugins {
  pluginExtendedConfig: LegacyConfig;
  settings: LegacyVars;
}
EOF

echo
echo ":-) Patched successfully!!!"
echo
