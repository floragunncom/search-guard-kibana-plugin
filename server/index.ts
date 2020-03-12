import { PluginInitializerContext } from "../../../src/core/server/plugins";
import { Plugin } from './serverPlugin';
import { schema } from '@kbn/config-schema';

export const ConfigSchema = schema.object({

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


  enabled: schema.boolean({ defaultValue: true }),
  username: schema.string({ defaultValue: ''}),
});

export const config = {
  //path: 'searchguard',
  exposeToBrowser: {
    username: true,
    basicauth: {
      login: true // @todo Seems like this exposes the entire basicauth object
    }
  },
  schema: ConfigSchema,
};


export function plugin(initializerContext: PluginInitializerContext): Plugin {
  return new Plugin(initializerContext);
}