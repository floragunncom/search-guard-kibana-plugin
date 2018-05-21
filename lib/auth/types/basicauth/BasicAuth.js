import AuthType from "../AuthType";
import Boom from 'boom';
// @todo Do we need to import this in the sub class too?
import { assign } from 'lodash';
import InvalidSessionError from "../../errors/invalid_session_error";
import MissingTenantError from "../../errors/missing_tenant_error";

export default class BasicAuth extends AuthType {

    constructor(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {
        super(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);

        /**
         * The authType is saved in the auth cookie for later reference
         * @type {string}
         */
        this.type = 'basicauth';

        /**
         * Tells the sessionPlugin whether or not to validate the number of tenants when authenticating.
         * Basic auth already handles this in the login process, so we ignore it here.
         * @type {boolean}
         */
        this.validateAvailableTenants = false;
    }
    
    init() {
        this.setupStorage();
        this.setupAuthScheme();
        this.setupRoutes();
        this.assignAuthHeader();
    }

    async authenticate(credentials) {

        // A login can happen via a POST request (login form) or when we have request headers with user credentials.
        // We also need to re-authenticate if the credentials (headers) don't match what's in the session.
        try {
            let user = await this.server.plugins.searchguard.getSearchGuardBackend().authenticate(credentials);
            let session = {
                username: user.username,
                credentials: credentials,
                authType: this.type
            };

            if(this.sessionTTL) {
                session.expiryTime = Date.now() + this.sessionTTL
            }

            return {
                session,
                user
            }
        } catch(error) {
            throw error;
        }
    }

    /**
     * Returns the auth header needed for the Search Guard backend
     * @param session
     * @returns {*}
     */
    getAuthHeader(session) {
        if (session.credentials) {
            const authHeader = new Buffer(`${session.credentials.username}:${session.credentials.password}`).toString('base64');
            return {
                'authorization': `Basic ${authHeader}`
            };
        }

        return false;
    }

    detectAuthHeaderCredentials(request, sessionCredentials = null) {

        if (request.headers.authorization) {
            var tmp = request.headers.authorization.split(' ');
            var creds = new Buffer(tmp[1], 'base64').toString().split(':');

            if (sessionCredentials !== null && sessionCredentials.username === creds[0] && sessionCredentials.password === creds[1]) {
                // The auth header credentials are the same as those in the session,
                // no need to return new credentials so we can just return null
                return null;
            }

            return {
                username: creds[0],
                password: creds[1]
            };
        }

        return null;
    }

    onUnAuthenticated(request, reply) {
        const nextUrl = encodeURIComponent(request.url.path);
        return reply.redirect(`${this.basePath}${this.APP_ROOT}/login?nextUrl=${nextUrl}`);
    }

    setupRoutes() {
        require('./routes')(this.pluginRoot, this.server, this.kbnServer, this.APP_ROOT, this.API_ROOT);
    }
}