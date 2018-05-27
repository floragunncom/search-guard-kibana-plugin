import MissingTenantError from "../auth/errors/missing_tenant_error";

var Hoek = require('hoek');
var Joi = require('joi');

/**
 * Name of the cookie where we store additional session information, such as authInfo
 * @type {string}
 */
const storageCookieName = 'searchguard_storage';

let internals = {};

internals.config = Joi.object({
    authType: Joi.string().allow(null),
    authenticateFunction: Joi.func(),
    validateAvailableTenants: Joi.boolean().default(true)
}).required();


exports.register = async function (server, options, next) {
    let results = Joi.validate(options, internals.config);
    Hoek.assert(!results.error, results.error);

    let settings = results.value;

    // @todo Don't register e.g. authenticate() when we have Kerberos or Proxy-Auth?
    server.ext('onPreAuth', function (request, reply) {
        request.auth.sgSessionStorage = {
            /**
             *
             * @param credentials
             * @returns {Promise<*>}
             */
            authenticate: async function(credentials) {
                try {
                    // authResponse is an object with .session and .user
                    const authResponse = await settings.authenticateFunction(credentials);

                    // Make sure the user has a tenant that they can use
                    if(settings.validateAvailableTenants && server.config().get("searchguard.multitenancy.enabled") && ! server.config().get("searchguard.multitenancy.tenants.enable_global")) {
                        let privateTenantEnabled = server.config().get("searchguard.multitenancy.tenants.enable_private");

                        let allTenants = authResponse.user.tenants;
                        if (allTenants != null && ! privateTenantEnabled) {
                            delete allTenants[authResponse.user.username]
                        }

                        if (allTenants == null || Object.keys(allTenants).length === 0) {
                            throw new MissingTenantError('No tenant available for this user, please contact your system administrator.')
                        }
                    }

                    request.auth.session.set(authResponse.session);

                    this.setAuthInfo(authResponse.user.username, authResponse.user.backendroles, authResponse.user.roles, authResponse.user.tenants, authResponse.user.selectedTenant);

                    return authResponse;
                } catch(error) {
                    // Make sure we clear any existing cookies if something went wrong
                    this.clear();
                    throw error;
                }

            },

            getAuthType: function() {
                return this.authType;
            },

            /**
             * Remember to call this in the correct lifecycle step. Calling this in onPreAuth will most likely return false because auth is not set up yet.
             * @returns {boolean}
             */
            isAuthenticated: function() {
                if (request.auth && request.auth.isAuthenticated) {
                    return true;
                }

                return false;
            },

            getSession: function() {
                if (this.isAuthenticated()) {
                    // Maybe rename to get session and then e.g. basic auth can get session.credentials?
                    // @todo Not loving the credentials.credentials here.
                    // Split up into two cookies?
                    return request.auth.credentials;
                } else {
                    //console.log('Getting session, but not authenticated')
                }

                return null;
            },

            clear: function() {
                request.auth.session.clear();
                return reply({})
                    .unstate(storageCookieName)
                    .unstate('searchguard_tenant');
            },

            /**
             * Clears the extra storage cookie only.
             * Use .clear to remove both the auth and the storage cookies
             */
            clearStorage: function() {
                // @todo Test that this works
                reply({}).unstate('searchguard_storage');
            },

            /**
             * Store the result from the authinfo endpoint in the cookie.
             * We don't store everything at the moment.
             * @todo ask Jochen - custom_attribute_names could be too large for a cookie?
             *
             * @param user_name
             * @param backend_roles
             * @param sg_roles
             * @param sg_tenants
             * @param user_requested_tenant
             */
            setAuthInfo: function(user_name, backend_roles, sg_roles, sg_tenants, user_requested_tenant) {

                const authInfo = {
                    user_name,
                    backend_roles,
                    sg_roles,
                    sg_tenants,
                    user_requested_tenant
                };

                reply.state(storageCookieName, {authInfo});
            },

            validateStorageCookie: function() {
                let sessionStorage = request.state[storageCookieName];
                let authSession = this.getSession();

                // If we have an existing storage session and an existing auth session,
                // we can assume that they are connected. We should validate that
                // the auth session hasn't expired
                // @todo Is this really necessary? We write the authInfo every time
                // that we login, and we may need to provide the authInfo even
                // if we don't have an auth session (Kerberos?) @Jochen
                if (sessionStorage && authSession) {
                    if (authSession.exp && authSession.exp < Math.floor(Date.now() / 1000)) {
                        sessionStorage = null;
                    }

                    if (authSession.expiryTime && authSession.expiryTime < Date.now()) {
                        sessionStorage = null;
                    }
                }

                return sessionStorage;
            },

            getAuthInfo: async function() {

                // See if we have the value in the cookie
                if (this.authType !== null) {
                    let sessionStorage = this.validateStorageCookie();
                    if (sessionStorage && sessionStorage.authInfo) {
                        return sessionStorage.authInfo;
                    }
                }

                try {
                    let authInfo = await server.plugins.searchguard.getSearchGuardBackend().authinfo(request.headers);
                    // Don't save the authInfo in the cookie for e.g. Kerberos and Proxy-Auth
                    if (this.authType !== null && this.isAuthenticated()) {
                        this.setAuthInfo(authInfo.user_name, authInfo.backend_roles, authInfo.sg_roles, authInfo.sg_tenants, authInfo.user_requested_tenant);
                    }
                    
                    return authInfo;

                } catch (error) {
                    // Remove the storage cookie if something went wrong
                    if (this.authType !== null) {
                        reply().unstate(storageCookieName);
                    }

                    throw error;
                }
            }
        };

        return reply.continue();
    });

    next();
};


exports.register.attributes = {
    name: 'sg-session-storage'
};