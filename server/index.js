/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { Plugin } from './serverPlugin';
import { version as sgVersion } from '../package.json';

import { DEFAULT_CONFIG } from './applications/searchguard/read_kibana_config';

const getOpenIdSchema = (isSelectedAuthType) => {
  return schema.object({
    connect_url: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    header: schema.string({ defaultValue: 'Authorization' }),
    client_id: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    client_secret: schema.string({ defaultValue: '' }),
    scope: schema.string({ defaultValue: 'openid profile email address phone' }),
    base_redirect_url: schema.string({ defaultValue: '' }),
    logout_url: schema.string({ defaultValue: '' }),
    root_ca: schema.string({ defaultValue: '' }),
    verify_hostnames: schema.boolean({ defaultValue: true }),
  });
};

const getProxyCacheSchema = (isSelectedAuthType) => {
  return schema.object({
    user_header: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    roles_header: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    proxy_header: schema.string({ defaultValue: 'x-forwarded-for' }),
    proxy_header_ip: isSelectedAuthType ? schema.string() : schema.maybe(schema.string()),
    login_endpoint: schema.nullable(schema.string({ defaultValue: null })),
  });
};

// @todo We need to go through all of these and double check the default values, nullable, allow empty string etc.
export const ConfigSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),

  allow_client_certificates: schema.boolean({ defaultValue: false }),

  readonly_mode: schema.object({
    roles: schema.arrayOf(schema.string(), { defaultValue: [] }),
  }),

  xff: schema.object({
    enabled: schema.boolean({ defaultValue: false }),
  }),

  cookie: schema.object({
    secure: schema.boolean({ defaultValue: false }),
    name: schema.string({ defaultValue: 'searchguard_authentication' }),
    storage_cookie_name: schema.string({ defaultValue: 'searchguard_storage' }),
    preferences_cookie_name: schema.string({ defaultValue: 'searchguard_preferences' }),
    password: schema.string({
      minLength: 32,
      defaultValue: DEFAULT_CONFIG.searchguard.cookie.password,
    }),
    ttl: schema.number({ defaultValue: 60 * 60 * 1000 }),
    domain: schema.maybe(schema.string()),
    isSameSite: schema.oneOf(
      [
        // @todo Check the changes in Chrome 80 here - more values needed? Compare with hapi-auth-cookie
        schema.literal(false),
        schema.literal('Strict'),
        schema.literal('Lax'),
      ],
      { defaultValue: false }
    ),
  }),
  session: schema.object({
    ttl: schema.number({ min: 0, defaultValue: 60 * 60 * 1000 }),
    keepalive: schema.boolean({ defaultValue: true }),
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
      { defaultValue: 'basicauth' }
    ),
    anonymous_auth_enabled: schema.boolean({ defaultValue: false }),
    unauthenticated_routes: schema.arrayOf(schema.string(), { defaultValue: ['/api/status'] }),
    logout_url: schema.string({ defaultValue: '' }),
  }),

  /**
   * Basic auth
   */
  basicauth: schema.object({
    forbidden_usernames: schema.arrayOf(schema.string(), { defaultValue: [] }),
    allowed_usernames: schema.nullable(schema.arrayOf(schema.string())),
    header_trumps_session: schema.boolean({ defaultValue: false }),
    alternative_login: schema.object({
      headers: schema.arrayOf(schema.string(), { defaultValue: [] }),
      show_for_parameter: schema.string({ defaultValue: '' }),
      valid_redirects: schema.arrayOf(schema.string(), { defaultValue: [] }),
      button_text: schema.string({ defaultValue: 'Login with provider' }),
      buttonstyle: schema.string({ defaultValue: '' }),
    }),
    loadbalancer_url: schema.nullable(schema.string()),
    login: schema.object({
      title: schema.string({ defaultValue: 'Please login to Kibana' }),
      subtitle: schema.string({
        defaultValue:
          'If you have forgotten your username or password, please ask your system administrator',
      }),
      showbrandimage: schema.boolean({ defaultValue: true }),
      brandimage: schema.string({
        defaultValue: 'plugins/searchguard/assets/searchguard_logo.svg',
      }),
      buttonstyle: schema.string({ defaultValue: '' }),
    }),
  }),

  /**
   * Multitenancy
   */
  multitenancy: schema.object({
    enabled: schema.boolean({ defaultValue: false }),
    show_roles: schema.boolean({ defaultValue: false }),
    enable_filter: schema.boolean({ defaultValue: false }),
    debug: schema.boolean({ defaultValue: false }),
    tenants: schema.object({
      enable_private: schema.boolean({ defaultValue: true }),
      enable_global: schema.boolean({ defaultValue: true }),
      preferred: schema.maybe(schema.arrayOf(schema.string())),
    }),
    saved_objects_migration: schema.object({
      batch_size: schema.number({ defaultValue: 100 }),
      scroll_duration: schema.string({ defaultValue: '15m' }),
      poll_interval: schema.number({ defaultValue: 1500 }),
      skip: schema.boolean({ defaultValue: false }),
    }),
  }),
  saved_objects: schema.object({
    max_import_payload_bytes: schema.number({ defaultValue: 10485760 }),
    max_import_export_size: schema.number({ defaultValue: 10000 }),
  }),

  configuration: schema.object({
    enabled: schema.boolean({ defaultValue: true }),
  }),

  accountinfo: schema.object({
    enabled: schema.boolean({ defaultValue: false }),
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
    enabled: schema.boolean({ defaultValue: false }),
    login_endpoint: schema.maybe(schema.string()),
    url_param: schema.string({ defaultValue: 'authorization' }),
    header: schema.string({ defaultValue: 'Authorization' }),
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
};

export function plugin(initializerContext) {
  return new Plugin(initializerContext);
}
