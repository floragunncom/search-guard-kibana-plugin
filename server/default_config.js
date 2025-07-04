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

import { version as sgVersion } from '../package.json';

export const DEFAULT_CONFIG = {
  searchguard: {
    enabled: true,
    sg_frontend_config_id: "default",
	frontend_base_url: null,
    allow_client_certificates: false,
    readonly_mode: { enabled: true, roles: [] },
    xff: { enabled: true },
    cookie: {
      secure: false,
      password: 'searchguard_cookie_default_password',
      name: 'searchguard_authentication',
      ttl: null,
      isSameSite: 'Lax',
    },
    auth: {
      // @todo This is still being used in the FE, does it really work?
      type: 'default',
      anonymous_auth_enabled: false,
      unauthenticated_routes: ['/api/status', '/internal/security/me'],
      debug: false,
      jwt_param: {
        enabled: false,
        url_param: 'authorization',
      },
    },
    basicauth: {
      forbidden_usernames: [],
      allowed_usernames: null,
    },
    multitenancy: {
      debug: false,
    },
    configuration: {
      enabled: true,
      action_groups_page: { enabled: true },
      create_action_groups_page: { enabled: true },
      internal_users_page: { enabled: true },
      create_internal_users_page: { enabled: true },
      roles_page: { enabled: true },
      create_roles_page: { enabled: true },
      role_mappings_page: { enabled: true },
      create_role_mappings_page: { enabled: true },
      tenants_page: { enabled: true },
      create_tenants_page: { enabled: true },
      system_status_page: { enabled: true },
      license_page: { enabled: true },
      cache_page: { enabled: true },
    },
    accountinfo: {
      enabled: true,
    },
    sgVersion,
  },
};
