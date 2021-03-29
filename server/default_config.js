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
    allow_client_certificates: false,
    readonly_mode: { enabled: true, roles: [] },
    xff: { enabled: false },
    cookie: {
      secure: false,
      password: 'searchguard_cookie_default_password',
      name: 'searchguard_authentication',
      storage_cookie_name: 'searchguard_storage',
      preferences_cookie_name: 'searchguard_preferences',
      ttl: null,
      isSameSite: 'Lax',
    },
    session: {
      ttl: 3600000,
      keepalive: true,
    },
    auth: {
      type: 'basicauth',
      anonymous_auth_enabled: false,
      unauthenticated_routes: ['/api/status'],
      logout_url: '',
      debug: false,
    },
    basicauth: {
      forbidden_usernames: [],
      allowed_usernames: null,
      header_trumps_session: false,
      alternative_login: {
        headers: [],
        show_for_parameter: '',
        valid_redirects: [],
        button_text: 'Login with provider',
        buttonstyle: '',
      },
      loadbalancer_url: null,
      login: {
        title: 'Please login to Kibana',
        subtitle:
          'If you have forgotten your username or password, please ask your system administrator',
        showbrandimage: true,
        brandimage: 'plugins/searchguard/assets/searchguard_logo.svg',
        buttonstyle: '',
      },
    },
    multitenancy: {
      enabled: false,
      show_roles: false,
      enable_filter: false,
      debug: false,
      tenants: {
        enable_private: true,
        enable_global: true,
        preferred: undefined,
      },
      saved_objects_migration: {
        batch_size: 100,
        scroll_duration: '15m',
        poll_interval: 1500,
        skip: false,
        enableV2: true,
      },
    },
    configuration: {
      enabled: true,
    },
    accountinfo: {
      enabled: false,
    },
    openid: {
      connect_url: undefined,
      header: 'Authorization',
      client_id: undefined,
      client_secret: '',
      scope: 'openid profile email address phone',
      base_redirect_url: '',
      logout_url: '',
      root_ca: '',
      verify_hostnames: true,
    },
    proxycache: {
      user_header: undefined,
      roles_header: undefined,
      proxy_header: 'x-forwarded-for',
      proxy_header_ip: undefined,
      login_endpoint: null,
    },
    jwt: {
      enabled: false,
      login_endpoint: undefined,
      url_param: 'authorization',
      header: 'Authorization',
    },
    sgVersion,
  },
};
