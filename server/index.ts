import { PluginInitializerContext } from "../../../src/core/server/plugins";
import { Plugin } from './serverPlugin';
import { schema } from '@kbn/config-schema';

export const ConfigSchema = schema.object({

  cookie: schema.object({
    secure: schema.boolean({ defaultValue: false }),
    name: schema.string({ defaultValue: 'searchguard_authentication' }),
    storage_cookie_name: schema.string({ defaultValue: 'searchguard_storage' }),
    preferences_cookie_name: schema.string({ defaultValue: 'searchguard_preferences' }),
    password: schema.string({ minLength: 32, defaultValue: 'searchguard_cookie_default_password' }),
    ttl: schema.number({ defaultValue: 60 * 60 * 1000 }),
    domain: schema.maybe(schema.string()),
    isSameSite: schema.oneOf([
      // @todo Check the changes in Chrome 80 here
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

  basicauth: schema.object({
    forbidden_usernames: schema.arrayOf(schema.string(), { defaultValue: [] }),
    allowed_usernames: schema.nullable(schema.arrayOf(schema.string())),
    header_trumps_session: schema.boolean({ defaultValue: false}),
    loadbalancer_url: schema.nullable(schema.string()),
    alternative_login: schema.object({
      headers: schema.arrayOf(schema.string(), { defaultValue: [] }),
      show_for_parameter: schema.string({ defaultValue: '' }),
      valid_redirects: schema.arrayOf(schema.string(), { defaultValue: [] }),
      button_text: schema.string({ defaultValue: 'Login with provider' }),
      buttonstyle: schema.string({ defaultValue: '' }),
    }),
    login: schema.object({
      title: schema.string({ defaultValue: 'Please login to Kibana' }),
      subtitle: schema.string({ defaultValue: 'If you have forgotten your username or password, please ask your system administrator' }),
      showbrandimage: schema.boolean({ defaultValue: true }),
      brandimage: schema.string({ defaultValue: '/plugins/searchguard/assets/searchguard_logo.svg' }),
      buttonstyle: schema.string({ defaultValue: '' })
    })
  }),

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


  enabled: schema.boolean({ defaultValue: true }),
  username: schema.string({ defaultValue: ''}),
});

export const config = {
  //path: 'searchguard',
  exposeToBrowser: {
    username: true,
    multitenancy: true,
    basicauth: {
      login: true // @todo Seems like this exposes the entire basicauth object
    }
  },
  schema: ConfigSchema,
};


export function plugin(initializerContext: PluginInitializerContext): Plugin {
  return new Plugin(initializerContext);
}