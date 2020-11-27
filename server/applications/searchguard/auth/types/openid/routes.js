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

import { stringify, parse } from 'querystring';
import { randomString } from 'cryptiles';
import { sanitizeNextUrl } from '../../sanitize_next_url';
import MissingTenantError from '../../errors/missing_tenant_error';
import MissingRoleError from '../../errors/missing_role_error';
import { customError as customErrorRoute } from '../common/routes';
import { APP_ROOT, API_ROOT } from '../../../../../utils/constants';

export function defineRoutes({
  authInstance,
  kibanaCore,
  kibanaConfig,
  openIdEndPoints,
  Wreck,
  logger,
  debugLog,
}) {
  // TODO: remove the server when OpenID fixed for NP.
  const config = kibanaConfig;
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();
  const routesPath = '/auth/openid/';

  // OpenId config
  const clientId = config.get('searchguard.openid.client_id');
  const clientSecret = config.get('searchguard.openid.client_secret');

  // Scope must include "openid" if we need an id_token
  // Other available scopes as per the spec: https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
  const scope = config.get('searchguard.openid.scope').split(' ');
  if (scope.indexOf('openid') === -1) {
    scope.push('openid');
  }

  const loginSettings = {
    path: `${APP_ROOT}${routesPath}login`,
    validate: false,
    options: {
      authRequired: false,
    },
  };

  const finalLoginHandler = loginHandler({
    basePath,
    kibanaCore,
    config,
    routesPath,
    debugLog,
    authInstance,
    clientId,
    clientSecret,
    logger,
    scope,
    openIdEndPoints,
    Wreck,
  });
  router.get(loginSettings, finalLoginHandler);
  router.post(loginSettings, finalLoginHandler);

  /**
   * The error page.
   */
  customErrorRoute({ httpResources });

  /**
   * Clears the session and logs the user out from the IdP (if we have an endpoint available)
   * @url http://openid.net/specs/openid-connect-session-1_0.html#RPLogout
   */
  router.post(
    {
      path: `${API_ROOT}/auth/logout`,
      validate: false,
      options: {
        // We may need false here if the cookie has already expired
        authRequired: false,
      },
    },
    logoutHandler({ kibanaCore, config, authInstance, basePath, openIdEndPoints, logger })
  );
} //end module

/**
 * The redirect uri can't always be resolved automatically.
 * Instead, we have the searchguard.openid.base_redirect_uri config option.
 * @returns {string}
 */
function getBaseRedirectUrl({ kibanaCore, config }) {
  const configuredBaseRedirectUrl = config.get('searchguard.openid.base_redirect_url');
  if (configuredBaseRedirectUrl) {
    return configuredBaseRedirectUrl.endsWith('/')
      ? configuredBaseRedirectUrl.slice(0, -1)
      : configuredBaseRedirectUrl;
  }

  // Config option not used, try to get the correct protocol and host
  const serverInfo = kibanaCore.http.getServerInfo();
  let host = serverInfo.hostname;
  const port = serverInfo.port;
  if (port) {
    host = host + ':' + port;
  }

  const baseRedirectUrl = `${serverInfo.protocol}://${host}`;
  return baseRedirectUrl;
}

export function logoutHandler({
  kibanaCore,
  config,
  authInstance,
  basePath,
  openIdEndPoints,
  logger,
}) {
  return async (context, request, response) => {
    // Build the redirect uri needed by the provider
    const baseRedirectUrl = getBaseRedirectUrl({ kibanaCore, config });

    const sessionCookie = (await authInstance.sessionStorageFactory.asScoped(request).get()) || {};

    // Clear the cookie credentials
    await authInstance.clear(request);

    const requestQueryParameters = `?post_logout_redirect_uri=${baseRedirectUrl}${basePath}/app/home`;

    // If we don't have an "end_session_endpoint" in the .well-known list,
    // we may have a custom logout_url defined in the config.
    // The custom url trumps the .well-known endpoint if both are available.
    const customLogoutUrl = config.get('searchguard.openid.logout_url');
    let endSessionUrl = null;
    if (customLogoutUrl) {
      // Pass the post_logout_uri just in case, but not the token
      endSessionUrl = customLogoutUrl + requestQueryParameters;
    } else if (openIdEndPoints.end_session_endpoint) {
      endSessionUrl = openIdEndPoints.end_session_endpoint + requestQueryParameters;

      // Pass the token to the IdP when logging out (id_token_hint)
      try {
        let idTokenHint = '';
        if (sessionCookie.credentials && sessionCookie.credentials.authHeaderValue) {
          idTokenHint = sessionCookie.credentials.authHeaderValue.split(' ')[1];
          endSessionUrl = endSessionUrl + '&id_token_hint=' + idTokenHint;
        }
      } catch (error) {
        logger.info('Could not add the id_token_hint to the logout url');
      }
    }

    return response.ok({
      body: { redirectURL: endSessionUrl },
    });
  };
}

export function loginHandler({
  basePath,
  kibanaCore,
  config,
  routesPath,
  debugLog,
  authInstance,
  logger,
  clientId,
  clientSecret,
  scope,
  openIdEndPoints,
  Wreck,
}) {
  return async function (context, request, response) {
    const baseRedirectUrl = `${getBaseRedirectUrl({ kibanaCore, config })}${basePath}`;
    debugLog('Base redirect url: ' + baseRedirectUrl);
    const redirectUri = encodeURI(baseRedirectUrl + routesPath + 'login');
    const authCode = request.url.query.code;
    // Could not find any info about length of the nonce in
    // the OpenId spec, so I went with what we had before
    // the migration.
    const nonce = randomString(22);

    if (!authCode) {
      return handleAuthRequest({
        request,
        response,
        sessionStorageFactory: authInstance.sessionStorageFactory,
        clientId,
        clientSecret,
        redirectUri,
        nonce,
        scope,
        openIdEndPoints,
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

      // The usage of nonce vs. state is a bit confusing here. Keeping with nonce
      // internally, but state when we pass a parameter to the IdP to make sure
      // I don't introduce any change here - it seems to have worked well with
      // all IdPs
      if (!cookieOpenId.nonce || cookieOpenId.nonce !== request.url.query.state) {
        throw new Error('There was a state mismatch between the cookie and the IdP response');
      }

      // Get the tokens from the IdP
      const idpPayload = await handleIdTokenRequest({
        logger,
        clientId,
        clientSecret,
        authCode,
        redirectUri,
        Wreck,
        openIdEndPoints,
      });

      // Authenticate with the token given to us by the IdP
      await authInstance.handleAuthenticate(request, {
        authHeaderValue: 'Bearer ' + idpPayload.id_token,
      });

      let redirectTo = '/app/home';
      if (cookieOpenId.query && cookieOpenId.query.nextUrl) {
        redirectTo = sanitizeNextUrl(cookieOpenId.query.nextUrl, basePath);
      }

      // All good, redirect to home
      return response.redirected({
        headers: {
          location: redirectTo,
        },
      });
    } catch (error) {
      logger.error(`Error while trying to authenticate ${error.stack}`);
      // If we've come this far, we should have already logged an error
      let redirectTo = basePath + '/customerror?type=authError';

      if (error instanceof MissingTenantError) {
        redirectTo = basePath + '/customerror?type=missingTenant';
      } else if (error instanceof MissingRoleError) {
        redirectTo = basePath + '/customerror?type=missingRole';
      }

      return response.redirected({
        headers: {
          location: redirectTo,
        },
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
  sessionStorageFactory,
  clientId,
  redirectUri,
  nonce,
  scope,
  openIdEndPoints,
}) {
  // Build the query parameters that will be sent to the IdP
  const query = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    state: nonce,
    scope: scope.join(' '),
  };

  const sessionCookie = (await sessionStorageFactory.asScoped(request).get()) || {};
  sessionCookie.openId = {
    nonce,
    query: request.url.query,
  };
  await sessionStorageFactory.asScoped(request).set(sessionCookie);

  const idpAuthLocation = openIdEndPoints.authorization_endpoint + '?' + stringify(query);

  return response.redirected({
    headers: {
      location: idpAuthLocation,
    },
  });
}

/**
 * Handle the request to obtain the id_token that we need to authenticate with
 * @param logger
 * @param clientId
 * @param clientSecret
 * @param authCode
 * @param redirectUri
 * @returns {Promise<{payload}>}
 */
async function handleIdTokenRequest({
  logger,
  clientId,
  clientSecret,
  authCode,
  redirectUri,
  Wreck,
  openIdEndPoints,
}) {
  const query = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: redirectUri,
  };

  // Get the necessary tokens from the IdP
  let payload;
  try {
    const authHeaderValue = Buffer.from(clientId + ':' + clientSecret, 'utf8').toString('base64');
    const idpResponse = await Wreck.post(openIdEndPoints.token_endpoint, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + authHeaderValue,
      },
      payload: stringify(query),
    });

    payload = idpResponse.payload.toString();
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      payload = parse(payload);
    }

    if (!payload.id_token) {
      throw new Error('IdP payload is missing the id_token');
    }
  } catch (error) {
    logger.error(`Error while retrieving the token from the IdP: ${error.stack}`);
    throw error;
  }

  return payload;
}