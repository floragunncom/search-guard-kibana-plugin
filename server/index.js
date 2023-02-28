/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import { schema } from '@osd/config-schema';
import { ServerPlugin } from './serverPlugin';
import { version as spVersion } from '../package.json';
import { DEFAULT_CONFIG } from './default_config';

const {
  eliatra: {
    security: {
      cookie: cookieDefaults,
      auth: authDefaults,
      basicauth: basicauthDefaults,
      multitenancy: multitenancyDefaults,
      configuration: configurationDefaults,
      ...eliatrasuiteDefaults
    } = {},
  }
} = DEFAULT_CONFIG;

// @todo We need to go through all of these and double check the default values, nullable, allow empty string etc.
export const ConfigSchema = schema.object({

  security: schema.object({

    enabled: schema.boolean({defaultValue: eliatrasuiteDefaults.enabled}),

    sp_frontend_config_id: schema.string({defaultValue: eliatrasuiteDefaults.sp_frontend_config_id}),

    frontend_base_url: schema.string({defaultValue: eliatrasuiteDefaults.frontend_base_url}),

    allow_client_certificates: schema.boolean({
      defaultValue: eliatrasuiteDefaults.allow_client_certificates,
    }),

    readonly_mode: schema.object({
      enabled: schema.boolean({defaultValue: eliatrasuiteDefaults.readonly_mode.enabled}),
      roles: schema.arrayOf(schema.string(), {
        defaultValue: eliatrasuiteDefaults.readonly_mode.roles,
      }),
    }),

    xff: schema.object({
      enabled: schema.boolean({defaultValue: eliatrasuiteDefaults.xff.enabled}),
    }),

    cookie: schema.object({
      secure: schema.boolean({defaultValue: cookieDefaults.secure}),
      name: schema.string({defaultValue: cookieDefaults.name}),
      password: schema.string({
        minLength: 32,
        defaultValue: cookieDefaults.password,
      }),
      ttl: schema.nullable(schema.number({defaultValue: cookieDefaults.ttl})),
      domain: schema.maybe(schema.string()),
      isSameSite: schema.oneOf(
        [
          // @todo Check the changes in Chrome 80 here - more values needed? Compare with hapi-auth-cookie
          schema.literal('None'),
          schema.literal('Strict'),
          schema.literal('Lax'),
        ],
        {defaultValue: cookieDefaults.isSameSite}
      ),
    }),

    /**
     * General auth
     */
    auth: schema.object({
      type: schema.oneOf(
        [
          schema.literal('default'),
          schema.literal('proxy'),
          schema.literal('kerberos'),
        ],
        {defaultValue: authDefaults.type}
      ),
      anonymous_auth_enabled: schema.boolean({defaultValue: authDefaults.anonymous_auth_enabled}),
      unauthenticated_routes: schema.arrayOf(schema.string(), {
        defaultValue: authDefaults.unauthenticated_routes,
      }),
      /*
        Caution: Enabling this may cause sensitive authentication information (e.g. credentials) to be logged
      */
      debug: schema.boolean({defaultValue: authDefaults.debug}),

      jwt_param: schema.object({
        enabled: schema.boolean({defaultValue: authDefaults.jwt_param.enabled}),
        url_param: schema.string({defaultValue: authDefaults.jwt_param.url_param})
      }),
    }),

    /**
     * Basic auth
     */
    basicauth: schema.object({
      forbidden_usernames: schema.arrayOf(schema.string(), {
        defaultValue: basicauthDefaults.forbidden_usernames,
      }),
      allowed_usernames: schema.nullable(schema.arrayOf(schema.string())),

    }),

    /**
     * Multitenancy
     */
    multitenancy: schema.object({
      enabled: schema.boolean({defaultValue: multitenancyDefaults.enabled}),
      show_roles: schema.boolean({defaultValue: multitenancyDefaults.show_roles}),
      enable_filter: schema.boolean({defaultValue: multitenancyDefaults.enable_filter}),
      debug: schema.boolean({defaultValue: multitenancyDefaults.debug}),
      tenants: schema.object({
        enable_private: schema.boolean({defaultValue: multitenancyDefaults.tenants.enable_private}),
        enable_global: schema.boolean({defaultValue: multitenancyDefaults.tenants.enable_global}),
        preferred: schema.maybe(schema.arrayOf(schema.string())),
      }),
      saved_objects_migration: schema.object({
        batch_size: schema.number({
          defaultValue: multitenancyDefaults.saved_objects_migration.batch_size,
        }),
        scroll_duration: schema.string({
          defaultValue: multitenancyDefaults.saved_objects_migration.scroll_duration,
        }),
        poll_interval: schema.number({
          defaultValue: multitenancyDefaults.saved_objects_migration.poll_interval,
        }),
        skip: schema.boolean({defaultValue: multitenancyDefaults.saved_objects_migration.skip}),
      }),
    }),
    saved_objects: schema.object({
      max_import_payload_bytes: schema.number({
        defaultValue: eliatrasuiteDefaults.saved_objects.max_import_payload_bytes,
      }),
      max_import_export_size: schema.number({
        defaultValue: eliatrasuiteDefaults.saved_objects.max_import_export_size,
      }),
    }),

    configuration: schema.object({
      enabled: schema.boolean({defaultValue: configurationDefaults.enabled}),
      action_groups_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.action_groups_page.enabled,
        }),
      }),
      create_action_groups_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.create_action_groups_page.enabled,
        }),
      }),
      internal_users_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.internal_users_page.enabled,
        }),
      }),
      create_internal_users_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.create_internal_users_page.enabled,
        }),
      }),
      roles_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.roles_page.enabled,
        }),
      }),
      create_roles_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.create_roles_page.enabled,
        }),
      }),
      role_mappings_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.role_mappings_page.enabled,
        }),
      }),
      create_role_mappings_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.create_role_mappings_page.enabled,
        }),
      }),
      tenants_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.tenants_page.enabled,
        }),
      }),
      create_tenants_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.create_tenants_page.enabled,
        }),
      }),
      system_status_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.system_status_page.enabled,
        }),
      }),
      license_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.license_page.enabled,
        }),
      }),
      cache_page: schema.object({
        enabled: schema.boolean({
          defaultValue: configurationDefaults.cache_page.enabled,
        }),
      }),
    }),

    accountinfo: schema.object({
      enabled: schema.boolean({defaultValue: eliatrasuiteDefaults.accountinfo.enabled}),
    }),

    spVersion: schema.string({defaultValue: spVersion}),
  })
});

export const config = {
  // @todo If you need to expose something to the browser,
  // use the config route handler instead
  exposeToBrowser: {
    //auth: true,
    //multitenancy: true,
    //basicauth: true,
    //configuration: true,
    //accountinfo: true,
    //readonly_mode: true,
    //spVersion: true,
  },
  schema: ConfigSchema,
  deprecations: ({ unusedFromRoot }) => {
    return [];
  },
};

export function plugin(initializerContext) {
  return new ServerPlugin(initializerContext);
}
