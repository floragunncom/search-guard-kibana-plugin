/*
 *    Copyright 2020 floragunn GmbH
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

import { schema } from '@kbn/config-schema';
import { ServerPlugin } from './serverPlugin';
import { version as sgVersion } from '../package.json';
import { DEFAULT_CONFIG } from './default_config';

const {
  searchguard: {
    cookie: cookieDefaults,
    auth: authDefaults,
    basicauth: basicauthDefaults,
    multitenancy: multitenancyDefaults,
    ...searchguardDefaults
  } = {},
} = DEFAULT_CONFIG;

// @todo We need to go through all of these and double check the default values, nullable, allow empty string etc.
export const ConfigSchema = schema.object({
  enabled: schema.boolean({ defaultValue: searchguardDefaults.enabled }),

  sg_frontend_config_id: schema.string({ defaultValue: searchguardDefaults.sg_frontend_config_id }),

  frontend_base_url: schema.string({ defaultValue: searchguardDefaults.frontend_base_url }),

  allow_client_certificates: schema.boolean({
    defaultValue: searchguardDefaults.allow_client_certificates,
  }),

  readonly_mode: schema.object({
    enabled: schema.boolean({ defaultValue: searchguardDefaults.readonly_mode.enabled }),
    roles: schema.arrayOf(schema.string(), {
      defaultValue: searchguardDefaults.readonly_mode.roles,
    }),
  }),

  xff: schema.object({
    enabled: schema.boolean({ defaultValue: searchguardDefaults.xff.enabled }),
  }),

  cookie: schema.object({
    secure: schema.boolean({ defaultValue: cookieDefaults.secure }),
    name: schema.string({ defaultValue: cookieDefaults.name }),
    password: schema.string({
      minLength: 32,
      defaultValue: cookieDefaults.password,
    }),
    ttl: schema.nullable(schema.number({ defaultValue: cookieDefaults.ttl })),
    domain: schema.maybe(schema.string()),
    isSameSite: schema.oneOf(
      [
        // @todo Check the changes in Chrome 80 here - more values needed? Compare with hapi-auth-cookie
        schema.literal('None'),
        schema.literal('Strict'),
        schema.literal('Lax'),
      ],
      { defaultValue: cookieDefaults.isSameSite }
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
      { defaultValue: authDefaults.type }
    ),
    anonymous_auth_enabled: schema.boolean({ defaultValue: authDefaults.anonymous_auth_enabled }),
    unauthenticated_routes: schema.arrayOf(schema.string(), {
      defaultValue: authDefaults.unauthenticated_routes,
    }),
    /*
      Caution: Enabling this may cause sensitive authentication information (e.g. credentials) to be logged
    */
    debug: schema.boolean({ defaultValue: authDefaults.debug }),

    jwt_param: schema.object({
    	enabled: schema.boolean({ defaultValue: authDefaults.jwt_param.enabled }),
    	url_param: schema.string({ defaultValue: authDefaults.jwt_param.url_param })
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
    debug: schema.boolean({ defaultValue: multitenancyDefaults.debug }),
    /*
      Tenant-scope the Kibana Reporting management read endpoints (list,
      count, info, download, delete) so each tenant only ever sees its own
      reports. The filter mode decides how a report's tenant is determined:
      - 'node_decrypt' (default): no ES backend support needed. Decrypts each
        report's stored request headers with reporting_encryption_key, which
        MUST mirror xpack.reporting.encryptionKey exactly (and that key must
        be explicitly set in kibana.yml).
      - 'header_passthrough': the Search Guard ES backend filters the
        reporting indices by the sgtenant header. Backend support required.
      - 'term': the Search Guard ES backend stamps a queryable sg_tenant
        field on report docs. Backend support required.
      See server/applications/multitenancy/REPORT_TENANT_SCOPING.md
    */
    report_tenant_scoping: schema.object({
      enabled: schema.boolean({
        defaultValue: multitenancyDefaults.report_tenant_scoping.enabled,
      }),
      filter: schema.oneOf(
        [
          schema.literal('node_decrypt'),
          schema.literal('header_passthrough'),
          schema.literal('term'),
        ],
        { defaultValue: multitenancyDefaults.report_tenant_scoping.filter }
      ),
      reporting_encryption_key: schema.nullable(schema.string()),
      max_scan_docs: schema.number({
        defaultValue: multitenancyDefaults.report_tenant_scoping.max_scan_docs,
      }),
    }),
  }),
  configuration: schema.object({
    enabled: schema.boolean({ defaultValue: searchguardDefaults.configuration.enabled }),
    action_groups_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.action_groups_page.enabled,
      }),
    }),
    create_action_groups_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.create_action_groups_page.enabled,
      }),
    }),
    internal_users_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.internal_users_page.enabled,
      }),
    }),
    create_internal_users_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.create_internal_users_page.enabled,
      }),
    }),
    roles_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.roles_page.enabled,
      }),
    }),
    create_roles_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.create_roles_page.enabled,
      }),
    }),
    role_mappings_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.role_mappings_page.enabled,
      }),
    }),
    create_role_mappings_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.create_role_mappings_page.enabled,
      }),
    }),
    tenants_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.tenants_page.enabled,
      }),
    }),
    create_tenants_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.create_tenants_page.enabled,
      }),
    }),
    system_status_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.system_status_page.enabled,
      }),
    }),
    license_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.license_page.enabled,
      }),
    }),
    cache_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.cache_page.enabled,
      }),
    }),
  }),

  accountinfo: schema.object({
    enabled: schema.boolean({ defaultValue: searchguardDefaults.accountinfo.enabled }),
  }),

  sgVersion: schema.string({ defaultValue: sgVersion }),
});

export const config = {
  exposeToBrowser: {
    auth: true,
    multitenancy: true,
    basicauth: true,
    configuration: true,
    accountinfo: true,
    readonly_mode: true,
    sgVersion: true,
  },
  schema: ConfigSchema,
  deprecations: ({ unusedFromRoot }) => {
    return [];
  },
};

export function plugin(initializerContext) {
  return new ServerPlugin(initializerContext);
}
