const pluginRoot = require('requirefrom')('');
import { resolve, join, sep } from 'path';

export default function (kibana) {

    let APP_ROOT;
    let API_ROOT;
    let authenticationBackend;
    let searchGuardConfiguration;

    return new kibana.Plugin({
        name: 'searchguard',
        require: ['kibana', 'elasticsearch'],

        // config validation
        config(Joi) {
            return Joi.object({
                enabled: Joi.boolean().default(true),
                session: Joi.object().keys({
                    ttl: Joi.number().integer().min(1).default(60 * 60 * 1000),
                    keepalive: Joi.boolean().default(true)
                }),
                cookie: Joi.object().keys({
                    password: Joi.string(), // gets validated manually
                    secure: Joi.boolean().default(false),
                    name: Joi.string().default('searchguard_authentication'),
                    ttl: Joi.number().integer().min(0).allow(null),
                })
            }).default();
        },

        uiExports: {
            hacks: [
                'plugins/searchguard/chrome/logout_button',
                'plugins/searchguard/services/access_control'
            ],
            apps: [{
                id: 'searchguard-login',
                title: 'Login',
                main: 'plugins/searchguard/apps/login',
                hidden: true,
                auth: false
            }],
            chromeNavControls: [
                'plugins/searchguard/chrome/btn_logout/btn_logout.js'
            ]
        },

        init(server, options) {

            APP_ROOT = '/searchguard';
            API_ROOT = `${APP_ROOT}/api`;

            const config = server.config();

            // validate config, only mandatory field is password
            if(config.get('searchguard.cookie.password') == null) {
                this.status.red('searchguard.cookie.password not set in kibana.yml, please specify this value (min. 32 characters)');
                throw new Error('+++ Search Guard authentication not available +++');
            }

            server.register([
                require('hapi-async-handler'),
                require('hapi-auth-cookie'),
                require('hapi-authorization')
            ], (error) => {
                if (error) {
                    server.log(['error', 'searchguard'], `An error occurred registering server plugins: ${error}`);
                    this.status.red('An error occurred during initialisation, please check the logs.');
                    return;
                }

                this.status.yellow('Initialising Search Guard authentication plugin.');

                // provides authentication methods against Search Guard
                const BackendClass = pluginRoot(`lib/backend/searchguard`);
                const authenticationBackend = new BackendClass(server, server.config);

                // we use the cookie strategy
                require('./lib/hapi/auth')(pluginRoot, server, APP_ROOT, API_ROOT);

                // all your routes are belong to us
                require('./lib/routes/routes')(pluginRoot, server, this, APP_ROOT, API_ROOT);

                // make auth backend available
                server.expose('getAuthenticationBackend', () => authenticationBackend);

                this.status.green('Search Guard access control initialised.');
            });

        }

    });
};
