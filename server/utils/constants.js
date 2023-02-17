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

// ---- Dashboards routes
export const APP_ROOT = '';
export const API_ROOT = `${APP_ROOT}/api/v1`;

// ---- OpenSearch Plugin routes

// INFO ENDPOINTS
export const AUTHINFO_ENDPOINT = "/_eliatra/security/authinfo";
export const DASHBOARDSINFO_ENDPOINT = "/_eliatra/security/dashboardsinfo";
export const PERMISSIONSSINFO_ENDPOINT = "/_eliatra/security/permission";
export const LICENSEINFO_ENDPOINT = "/_eliatra/security/license";
export const TENANTINFO_ENDPOINT = "/_eliatra/security/tenantinfo";

// AUTH ENDPOINTS
export const BACKEND_AUTH_BASEURL = "/_eliatra/security/auth";

// REST API ENDPOINTS
export const BACKEND_RESTAPI_BASEURL = "/_eliatra/security/api";

// AUTHTOKENS ENDPOINTS
export const BACKEND_AUTHTOKENS_BASEURL = "/_eliatra/security/authtoken"

export const ES_SCROLL_SETTINGS = {
  KEEPALIVE: '25s',
};
