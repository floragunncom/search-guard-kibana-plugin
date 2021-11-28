/*
 *    Copyright 2021 floragunn GmbH
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
import { sanitizeNextUrl } from '../../sanitize_next_url';
import { APP_ROOT } from '../../../../../utils/constants';

export const OIDC_ROUTES = {
  LOGIN: `${APP_ROOT}/auth/openid/login`,
};

export function defineRoutes({
  authInstance,
  kibanaCore,
  kibanaConfig,
  logger,
  debugLog,
  searchGuardBackend,
}) {
  const config = kibanaConfig;
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const router = kibanaCore.http.createRouter();
  const routesPath = '/auth/openid/';

  const loginSettings = {
    path: `${APP_ROOT}${routesPath}login`,
    validate: {
      query: schema.object(
        {
          nextUrl: schema.maybe(schema.string()), // it comes from our login page
          next_url: schema.maybe(schema.string()), // it comes from the IDP login page
        },
        { unknowns: 'allow' }
      ),
    },
    options: {
      authRequired: false,
    },
  };

  router.get(
    loginSettings,
    loginHandler({
      basePath,
      kibanaCore,
      config,
      routesPath,
      debugLog,
      authInstance,
      logger,
      searchGuardBackend,
    })
  );

  // Keep a POST route in case the IdP uses POSTs
  router.post(
    loginSettings,
    loginHandler({
      basePath,
      kibanaCore,
      config,
      routesPath,
      debugLog,
      authInstance,
      logger,
      searchGuardBackend,
    })
  );
} //end module

export function loginHandler({ basePath, config, authInstance, logger, searchGuardBackend, kibanaCore }) {
  return async function (context, request, response) {
    const authCode = request.url.query.code;

    if (!authCode) {
      return handleAuthRequest({
        request,
        response,
        basePath,
        config,
        searchGuardBackend,
        sessionStorageFactory: authInstance.sessionStorageFactory,
        logger,
      });
    }

    // We have an auth code, now we need to try to exchange it for an id_token
    try {
      // Validate the nonce/state to make sure that the request was really
      // requested by Kibana in this session
      const sessionCookie =
        (await authInstance.sessionStorageFactory.asScoped(request).get()) || {};

      const cookieOpenId = sessionCookie.openId;

      if (!cookieOpenId) {
        // This seems to happen when we have
        // a) No more session on the IdP
        // and b) We delete our cookie completely.
        // @todo Can we somehow restart the process here?
        throw new Error(
          'OpenId request contained code, but we have no cookie content to compare with'
        );
      }

      // Make sure to clear out what was used for this login request.
      delete sessionCookie.openId;
      await authInstance.sessionStorageFactory.asScoped(request).set(sessionCookie);

      const credentials = {
        mode: 'oidc',
        sso_result: request.url.href,
        sso_context: cookieOpenId.nonce,
        id: cookieOpenId.authTypeId,
      };

      // Authenticate with the token given to us by the IdP
      const authResponse = await authInstance.handleAuthenticate(request, credentials);

      let redirectTo = '/';
      if (authResponse.redirectUri) {
        redirectTo = sanitizeNextUrl(authResponse.redirectUri, basePath);
      }

      // All good, redirect to home
      return response.redirected({
        headers: {
          location: redirectTo,
        },
      });
    } catch (error) {
      logger.error('Error while trying to authenticate', error.meta ? JSON.stringify(error.meta) : error);

	  var headers = {
		location: basePath + '/login?err=oidc',
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
  };
}

/**
 * Handle the first step of the process - obtain an auth code
 * @param request
 * @param response
 * @param sessionStorageFactory
 * @param clientId
 * @param redirectUri
 * @param nonce
 * @param scope
 * @returns {Promise<*>}
 */
async function handleAuthRequest({
  request,
  response,
  basePath,
  config,
  searchGuardBackend,
  sessionStorageFactory,
  logger,
}) {
  // Add the nextUrl to the redirect_uri as a parameter. The IDP uses the redirect_uri to redirect the user after successful authentication.
  // For example, it is used to redirect user to the correct dashboard if the user put shared URL in the browser address input before authentication.
  // To make this work, append the wildcard (*) to the valid redirect URI in the IDP configuration, for example
  // https://kibana.example.com:5601/auth/openid/login*
  let nextUrl = null;
  try {
    if (request.url.query.nextUrl && decodeURIComponent(request.url.query.nextUrl) !== '/') {
      // Do not add the nextUrl to the redirect_uri to avoid the following breaking
      // change for the users that use normal URL to authenticate.
      nextUrl = sanitizeNextUrl(request.url.query.nextUrl);
    }
  } catch (error) {
    // We may have received a malformed URL, caught by decodedURIComponent.
    // In this case we just proceed without a nextUrl.
  }

  let authConfig;
  const sessionCookie = (await sessionStorageFactory.asScoped(request).get()) || {};
  // We may have multiple OIDC configurations.
  // The authTypeId may still be in the cookie. This happens when
  // a session token expires and no explicit logout is made. We need
  // this behaviour so that we can "refresh" the credentials from the IdP.
  // (not to be confused with the OIDC refresh flow)

  const requestedAuthTypeId = request.url.query.authTypeId || sessionCookie.authTypeId;
  // Delete this again, otherwise the user won't get back to the login page
  // if trying to access Kibana again
  delete sessionCookie.authTypeId;
  delete sessionCookie.authType;

  const authConfigFinder = requestedAuthTypeId
    ? (config) => {
        return config.id === requestedAuthTypeId;
      }
    : (config) => {
        return config.method === 'oidc';
      };

  try {
    authConfig = (
      await searchGuardBackend.getAuthConfig(nextUrl)
    ).auth_methods.find(authConfigFinder);

    if (!authConfig) {
      throw new Error('Auth config not found');
    }
  } catch (error) {
    logger.error(`Error when trying to load the configuration for your IdP: ${error.stack}`);

	var headers = {
		location: basePath + '/login?err=oidc_init',
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

  const nonce = authConfig.sso_context;
  sessionCookie.openId = { nonce, authTypeId: authConfig.id || null, query: {} };
  await sessionStorageFactory.asScoped(request).set(sessionCookie);

  return response.redirected({
    headers: {
      location: authConfig.sso_location,
    },
  });
}
