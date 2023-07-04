/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2018 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { sanitizeNextUrl } from '../../sanitize_next_url';
import { schema } from '@kbn/config-schema';
import { APP_ROOT } from '../../../../../utils/constants';

export const SAML_ROUTES = {
  LOGIN: `${APP_ROOT}/auth/saml/login`,
};

export function defineRoutes({
  authInstance,
  searchGuardBackend,
  kibanaCore,
  debugLog,
  sessionStorageFactory,
  logger,
  configService,
}) {
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

  const routesPath = '/auth/saml/';

  /**
   * The login page.
   */
  router.get(
    {
      path: `${APP_ROOT}${routesPath}login`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async function (context, request, response) {
      const sessionCookie = (await sessionStorageFactory.asScoped(request).get()) || {};
      /*
      When successful logout,
        headers: {
          cookie: 'searchguard_authentication='
        },
      */

      // Add the nextUrl to the redirect_uri as a parameter. The IDP uses the redirect_uri to redirect the user after successful authentication.
      // For example, it is used to redirect user to the correct dashboard if the user put shared URL in the browser address input before authentication.
      // To make this work, append the wildcard (*) to the valid redirect URI in the IDP configuration, for example
      // https://kibana.example.com:5601/auth/oidc/login*
      let nextUrl = null;

      try {
        if (request.url.searchParams.get('nextUrl') && decodeURIComponent(request.url.searchParams.get('nextUrl')) !== '/') {
          // Do not add the nextUrl to the redirect_uri to avoid the following breaking
          // change for the users that use normal URL to authenticate.
          nextUrl = sanitizeNextUrl(request.url.searchParams.get('nextUrl'));
        }
      } catch (error) {
        // We may have received a malformed URL, caught by decodedURIComponent.
        // In this case we just proceed without a nextUrl.
      }

      try {
        // We may have multiple SAML configurations.
        // The authTypeId may still be in the cookie. This happens when
        // a session token expires and no explicit logout is made. We need
        // this behaviour so that we can "refresh" the credentials from the IdP.
        const requestedAuthTypeId = request.url.searchParams.get('authTypeId') || sessionCookie.authTypeId;
        // Delete this again, otherwise the user won't get back to the login page
        // if trying to access Kibana again
        delete sessionCookie.authTypeId;
        delete sessionCookie.authType;

        const authConfigFinder = requestedAuthTypeId
          ? (config) => {
              return config.id === requestedAuthTypeId;
            }
          : (config) => {
              return config.method === 'saml';
            };

        const authConfig = (
          await searchGuardBackend.getAuthConfig(nextUrl)
        ).auth_methods.find(authConfigFinder);

        if (!authConfig) {
          throw new Error('Auth config not found');
        }

        // When logging in, sessionCookie={}
        sessionCookie['temp-saml'] = {
          sso_context: authConfig.sso_context,
          authTypeId: authConfig.id || null,
        };
        await sessionStorageFactory.asScoped(request).set(sessionCookie);

        return response.redirected({ headers: { location: authConfig.sso_location } });
      } catch (error) {
        logger.error(`SAML auth, fail to obtain the SAML header: ${error.stack}`);

        var headers = {
		  location: basePath + '/searchguard/login?err=saml_init',
	    };

        var cookies = [];

        if (error.meta?.body?.error) {
	     cookies.push('sg_err=' + encodeURIComponent(error.meta?.body?.error) + "; Path=/");
	    } else if (error.message) {
	     cookies.push('sg_err=' + encodeURIComponent(error.message) + "; Path=/");
	    }

        if (error.meta?.body?.debug) {
	     cookies.push('sg_dbg=' + encodeURIComponent(JSON.stringify(error.meta?.body?.debug)) + "; Path=/");
	    }

	    if (cookies.length > 0) {
          headers['set-cookie'] = cookies;		
        }

        return response.redirected({
          headers,
        });

      }
    }
  );

  /*
  The page that the IDP redirects to after a successful SP-initiated login.
  */
  router.post(
    {
      path: `${APP_ROOT}/searchguard/saml/acs`,
      options: {
        authRequired: false,
        xsrfRequired: false,
      },
      validate: {
        body: schema.object(
          {
            SAMLResponse: schema.string(),
            RelayState: schema.maybe(schema.string()),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    async (context, request, response) => {
      try {
        const { body: { SAMLResponse, RelayState } = {} } = request;
        /*
        When logging in,
        SAMLResponse = PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2Fza...
        */

        const sessionCookie = await sessionStorageFactory.asScoped(request).get();
        if (!sessionCookie) {
          throw new Error('The session cookie is absent.');
        }
        /*
          When logging in,
          sessionCookie = {
            "temp-saml": {
              requestId: 'ONELOGIN_a0503578-1ae5-4621-80d5-49336f6d8673',
            }
          }
        */

        const { 'temp-saml': storedRequestInfo, ...restSessionCookie } = sessionCookie;
        await sessionStorageFactory.asScoped(request).set(restSessionCookie);

        await authInstance.handleAuthenticate(request, {
          mode: 'saml',
          saml_response: SAMLResponse,
          sso_context: storedRequestInfo.sso_context,
          id: storedRequestInfo.authTypeId,
        });

        const nextUrl = RelayState;

        if (nextUrl) {
          return response.redirected({
            headers: { location: sanitizeNextUrl(nextUrl, basePath) },
          });
        }

        return response.redirected({
          headers: { location: `${basePath}/app/home` },
        });
      } catch (error) {
        logger.error(`SAML auth, failed to authorize: ${error.stack}`);

        var headers = {
		  location: basePath + '/login?err=saml',
	    };

        var cookies = [];

        if (error.meta?.body?.error) {
	     cookies.push('sg_err=' + encodeURIComponent(error.meta?.body?.error) + "; Path=/");
	    } else if (error.message) {
	     cookies.push('sg_err=' + encodeURIComponent(error.message) + "; Path=/");
	    }

        if (error.meta?.body?.debug) {
	     cookies.push('sg_dbg=' + encodeURIComponent(JSON.stringify(error.meta?.body?.debug)) + "; Path=/");
	    }

	    if (cookies.length > 0) {
          headers['set-cookie'] = cookies;		
        }

        return response.redirected({
          headers,
        });
      }
    }
  );

  /**
   * The page that the IdP redirects to after a successful IdP-initiated login
   */
  router.post(
    {
      path: `${APP_ROOT}/searchguard/saml/acs/idpinitiated`,
      options: {
        authRequired: false,
        xsrfRequired: false,
      },
      validate: {
        body: schema.object(
          {
            SAMLResponse: schema.string(),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    async (context, request, response) => {
      try {
        await authInstance.handleAuthenticate(request, {
          mode: 'saml',
          saml_response: request.body.SAMLResponse,
          //sso_context: storedRequestInfo.sso_context,
          id: null,
        });

        debugLog('Got SAMLResponse: ' + request.body.SAMLResponse);

        return response.redirected({
          headers: { location: `${basePath}/app/kibana` },
        });
      } catch (error) {
        logger.error(`SAML IDP initiated authorization failed: ${error.stack}`);

        var headers = {
		  location: basePath + '/login?err=saml_idpinitiated',
	    };

        var cookies = [];

        if (error.meta?.body?.error) {
	     cookies.push('sg_err=' + encodeURIComponent(error.meta?.body?.error) + "; Path=/");
	    } else if (error.message) {
	     cookies.push('sg_err=' + encodeURIComponent(error.message) + "; Path=/");
	    }

        if (error.meta?.body?.debug) {
	     cookies.push('sg_dbg=' + encodeURIComponent(JSON.stringify(error.meta?.body?.debug)) + "; Path=/");
	    }

	    if (cookies.length > 0) {
          headers['set-cookie'] = cookies;		
        }

        return response.redirected({
          headers,
        });
      }
    }
  );

  /**
   * Redirect to logout page after an IdP redirect.
   * This is called after we log out from Kibana,
   * redirect to the IdP and then the IdP redirects
   * back to Kibana.
   */
  const logoutPath = `${APP_ROOT}/searchguard/saml/logout`;
  const logoutOptions = {
    authRequired: false,
    xsrfRequired: false,
  };
  const logoutHandler = async (context, request, response) => {
    await authInstance.clear(request);
    return response.redirected({
      headers: { location: `${basePath}/` },
    });
  };
  // Logout route accepts both GET and POST
  router.get({ path: logoutPath, options: logoutOptions, validate: false }, logoutHandler);
  router.post({ path: logoutPath, options: logoutOptions, validate: false }, logoutHandler);
} //end module
