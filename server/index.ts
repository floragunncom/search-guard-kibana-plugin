import { PluginInitializerContext } from "../../../src/core/server/plugins";
import { Plugin } from './serverPlugin';
import { schema } from '@kbn/config-schema';

export const ConfigSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),

  allow_client_certificates: schema.boolean({ defaultValue: false }),

  readonly_mode: schema.object({
    roles: schema.arrayOf(schema.string(), { defaultValue: [] })
  }),

  xff: schema.object({
    enabled: schema.boolean({ defaultValue: false }),
  }),

  cookie: schema.object({
    secure: schema.boolean({ defaultValue: false }),
    name: schema.string({ defaultValue: 'searchguard_authentication' }),
    storage_cookie_name: schema.string({ defaultValue: 'searchguard_storage' }),
    preferences_cookie_name: schema.string({ defaultValue: 'searchguard_preferences' }),
    password: schema.string({ minLength: 32, defaultValue: 'searchguard_cookie_default_password' }),
    ttl: schema.number({ defaultValue: 60 * 60 * 1000 }),
    domain: schema.maybe(schema.string()),
    isSameSite: schema.oneOf([
      // @todo Check the changes in Chrome 80 here - more values needed? Compare with hapi-auth-cookie
      schema.literal(false),
      schema.literal('Strict'),
      schema.literal('Lax')
      ],
      { defaultValue: false }
      ),
  }),
  session: schema.object({
    ttl: schema.number({ min: 0, defaultValue: 60 * 60 * 1000 }),
    keepalive: schema.boolean({ defaultValue: true })
  }),
  auth: schema.object({
    type: schema.oneOf([
      schema.literal(''),
      schema.literal('basicauth'),
      schema.literal('jwt'),
      schema.literal('openid'),
      schema.literal('saml'),
      schema.literal('proxy'),
      schema.literal('kerberos'),
      schema.literal('proxycache'),
    ], {defaultValue: ''}),
    anonymous_auth_enabled: schema.boolean({ defaultValue: false }),
    unauthenticated_routes: schema.arrayOf(schema.string(), { defaultValue: ['/api/status']}),
    logout_url: schema.string({ defaultValue: '' })
  }),

  /**
   * Basic auth
   */
  basicauth: schema.object({
    forbidden_usernames: schema.arrayOf(schema.string(), { defaultValue: [] }),
    allowed_usernames: schema.nullable(schema.arrayOf(schema.string())),
    header_trumps_session: schema.boolean({ defaultValue: false}),
    alternative_login: schema.object({
      headers: schema.arrayOf(schema.string(), { defaultValue: [] }),
      show_for_parameter: schema.string({ defaultValue: '' }),
      valid_redirects: schema.arrayOf(schema.string(), { defaultValue: [] }),
      button_text: schema.string({ defaultValue: 'Login with provider' }),
      buttonstyle: schema.object({}),
    }),
    loadbalancer_url: schema.nullable(schema.string()),
    login: schema.object({
      title: schema.string({ defaultValue: 'Please login to Kibana' }),
      subtitle: schema.string({ defaultValue: 'If you have forgotten your username or password, please ask your system administrator' }),
      showbrandimage: schema.boolean({ defaultValue: true }),
      brandimage: schema.string({ defaultValue: '/plugins/searchguard/assets/searchguard_logo.svg' }),
      buttonstyle: schema.object({})
    })
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
      preferred: schema.maybe(schema.arrayOf(schema.string()))
    })
  }),

  configuration: schema.object({
    enabled: schema.boolean({ defaultValue: true }),
  }),

  accountinfo: schema.object({
    enabled: schema.boolean({ defaultValue: false }),
  }),

  /*
  // @todo Missing config
  openid: Joi.object().keys({
                    connect_url: Joi.string(),
                    header: Joi.string().default('Authorization'),
                    client_id: Joi.string(),
                    client_secret: Joi.string().allow('').default(''),
                    scope: Joi.string().default('openid profile email address phone'),
                    base_redirect_url: Joi.string().allow('').default(''),
                    logout_url: Joi.string().allow('').default(''),
                    root_ca: Joi.string().allow('').default(''),
                    verify_hostnames: Joi.boolean().default(true)
                }).default().when('auth.type', {
                    is: 'openid',
                    then: Joi.object({
                        client_id: Joi.required(),
                        connect_url: Joi.required()
                    })
                }),
                proxycache: Joi.object().keys({
                    user_header: Joi.string(),
                    roles_header: Joi.string(),
                    proxy_header: Joi.string().default('x-forwarded-for'),
                    proxy_header_ip: Joi.string(),
                    login_endpoint: Joi.string().allow('', null).default(null),
                }).default().when('auth.type', {
                    is: 'proxycache',
                    then: Joi.object({
                        user_header: Joi.required(),
                        roles_header: Joi.required(),
                        proxy_header_ip: Joi.required()
                    })
                }),
                jwt: Joi.object().keys({
                    enabled: Joi.boolean().default(false),
                    login_endpoint: Joi.string(),
                    url_param: Joi.string().default('authorization'),
                    header: Joi.string().default('Authorization')
                }).default()
   */

});

export const config = {
  //path: 'searchguard',
  exposeToBrowser: {
    auth: true,
    multitenancy: true,
    basicauth: {
      login: true // @todo Seems like this exposes the entire basicauth object
    },
    configuration: true,
    accountinfo: true,
    readonly_mode: true,
  },
  schema: ConfigSchema,
};


export function plugin(initializerContext: PluginInitializerContext): Plugin {
  return new Plugin(initializerContext);
}