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
    openid: openidDefaults,
    proxycache: proxycacheDefaults,
    cookie: cookieDefaults,
    auth: authDefaults,
    basicauth: basicauthDefaults,
    multitenancy: multitenancyDefaults,
    jwt: jwtDefaults,
    login: loginDefaults,
    ...searchguardDefaults
  } = {},
} = DEFAULT_CONFIG;

const getOpenIdSchema = (isSelectedAuthType) => {
  return schema.object({
    header: schema.string({ defaultValue: openidDefaults.header }),
    client_id: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    client_secret: schema.string({ defaultValue: openidDefaults.client_secret }),
    scope: schema.string({ defaultValue: openidDefaults.scope }),
    base_redirect_url: schema.string({ defaultValue: openidDefaults.base_redirect_url }),
    logout_url: schema.string({ defaultValue: openidDefaults.logout_url }),
    preserve_target: schema.boolean({ defaultValue: openidDefaults.preserve_target }),
    /* @deprecated */
    connect_url: schema.maybe(schema.string()),
    /* @deprecated */
    root_ca: schema.string({ defaultValue: openidDefaults.root_ca }),
    /* @deprecated */
    verify_hostnames: schema.boolean({ defaultValue: openidDefaults.verify_hostnames }),
  });
};

const getProxyCacheSchema = (isSelectedAuthType) => {
  return schema.object({
    user_header: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    roles_header: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    proxy_header: schema.string({ defaultValue: proxycacheDefaults.proxy_header }),
    proxy_header_ip: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    login_endpoint: schema.nullable(
      schema.string({ defaultValue: proxycacheDefaults.login_endpoint })
    ),
  });
};

// @todo We need to go through all of these and double check the default values, nullable, allow empty string etc.
export const ConfigSchema = schema.object({
  enabled: schema.boolean({ defaultValue: searchguardDefaults.enabled }),

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
    // @todo How do we deprecate this without breaking changes
    storage_cookie_name: schema.string({ defaultValue: cookieDefaults.storage_cookie_name }),
    preferences_cookie_name: schema.string({
      defaultValue: cookieDefaults.preferences_cookie_name,
    }),
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
  session: schema.object({
    ttl: schema.number({ min: 0, defaultValue: searchguardDefaults.session.ttl }),
    keepalive: schema.boolean({ defaultValue: searchguardDefaults.session.keepalive }),
  }),

  /**
   * General auth
   */
  auth: schema.object({
    type: schema.oneOf(
      [
        schema.literal(''),
        schema.literal('basicauth'),
        schema.literal('jwt'),
        schema.literal('openid'),
        schema.literal('saml'),
        schema.literal('proxy'),
        schema.literal('kerberos'),
        schema.literal('proxycache'),
      ],
      { defaultValue: authDefaults.type }
    ),
    anonymous_auth_enabled: schema.boolean({ defaultValue: authDefaults.anonymous_auth_enabled }),
    unauthenticated_routes: schema.arrayOf(schema.string(), {
      defaultValue: authDefaults.unauthenticated_routes,
    }),
    logout_url: schema.string({ defaultValue: authDefaults.logout_url }),
    /*
      Caution: Enabling this may cause sensitive authentication information (e.g. credentials) to be logged
    */
    debug: schema.boolean({ defaultValue: authDefaults.debug }),
  }),

  /**
   * Basic auth
   */
  basicauth: schema.object({
    forbidden_usernames: schema.arrayOf(schema.string(), {
      defaultValue: basicauthDefaults.forbidden_usernames,
    }),
    allowed_usernames: schema.nullable(schema.arrayOf(schema.string())),
    header_trumps_session: schema.boolean({
      defaultValue: basicauthDefaults.header_trumps_session,
    }),
    loadbalancer_url: schema.nullable(schema.string()),
    alternative_login: schema.object({
      headers: schema.arrayOf(schema.string(), {
        defaultValue: basicauthDefaults.alternative_login.headers,
      }),
      show_for_parameter: schema.string({
        defaultValue: basicauthDefaults.alternative_login.show_for_parameter,
      }),
      valid_redirects: schema.arrayOf(schema.string(), {
        defaultValue: basicauthDefaults.alternative_login.valid_redirects,
      }),
      button_text: schema.string({ defaultValue: basicauthDefaults.alternative_login.button_text }),
      buttonstyle: schema.string({ defaultValue: basicauthDefaults.alternative_login.buttonstyle }),
    }),
  }),

  /**
   * Login page
   */
  login: schema.object({
    title: schema.string({ defaultValue: loginDefaults.title }),
    subtitle: schema.string({
      defaultValue: loginDefaults.subtitle,
    }),
    showbrandimage: schema.boolean({ defaultValue: loginDefaults.showbrandimage }),
    brandimage: schema.string({
      defaultValue: loginDefaults.brandimage,
    }),
    buttonstyle: schema.string({ defaultValue: loginDefaults.buttonstyle }),
  }),

  /**
   * Multitenancy
   */
  multitenancy: schema.object({
    enabled: schema.boolean({ defaultValue: multitenancyDefaults.enabled }),
    show_roles: schema.boolean({ defaultValue: multitenancyDefaults.show_roles }),
    enable_filter: schema.boolean({ defaultValue: multitenancyDefaults.enable_filter }),
    debug: schema.boolean({ defaultValue: multitenancyDefaults.debug }),
    tenants: schema.object({
      enable_private: schema.boolean({ defaultValue: multitenancyDefaults.tenants.enable_private }),
      enable_global: schema.boolean({ defaultValue: multitenancyDefaults.tenants.enable_global }),
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
      skip: schema.boolean({ defaultValue: multitenancyDefaults.saved_objects_migration.skip }),
      enableV2: schema.boolean({
        defaultValue: multitenancyDefaults.saved_objects_migration.enableV2,
      }),
      max_batch_size: schema.string({
        defaultValue: multitenancyDefaults.saved_objects_migration.max_batch_size
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
    auth_page: schema.object({
      enabled: schema.boolean({
        defaultValue: searchguardDefaults.configuration.auth_page.enabled,
      }),
    }),
  }),

  accountinfo: schema.object({
    enabled: schema.boolean({ defaultValue: searchguardDefaults.accountinfo.enabled }),
  }),

  openid: schema.conditional(
    schema.siblingRef('auth.type'),
    'openid',
    getOpenIdSchema(true),
    getOpenIdSchema(false)
  ),

  proxycache: schema.conditional(
    schema.siblingRef('auth.type'),
    'proxycache',
    getProxyCacheSchema(true),
    getProxyCacheSchema(false)
  ),

  jwt: schema.object({
    enabled: schema.boolean({ defaultValue: jwtDefaults.enabled }),
    login_endpoint: schema.maybe(schema.string()),
    url_param: schema.string({ defaultValue: jwtDefaults.url_param }),
    header: schema.string({ defaultValue: jwtDefaults.header }),
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
    login: true,
  },
  schema: ConfigSchema,
  deprecations: ({ unusedFromRoot }) => {
    return [
      unusedFromRoot('searchguard.openid.verify_hostnames'),
      unusedFromRoot('searchguard.openid.root_ca'),
      unusedFromRoot('searchguard.openid.connect_url'),
    ];
  },
};

export function plugin(initializerContext) {
  return new ServerPlugin(initializerContext);
}
