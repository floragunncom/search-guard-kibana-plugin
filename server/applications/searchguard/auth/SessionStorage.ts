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

import {
  KibanaRequest,
  SessionStorageFactory,
} from '../../../kibana_interfaces';

export interface IBasicAuthCredentials {
  authHeaderValue: string;
}

export interface ISessionCookie {
  expiryTime: number;
  tenant: string;
  credentials: IBasicAuthCredentials;
  username: string;
  authType: string;
  additionalAuthHeaders: null | object;
  isAnonymousAuth: boolean;
}

export interface ISessionStorage {
  get: (request: KibanaRequest) => Promise<ISessionCookie | null>;
  set: (request: KibanaRequest, sessionCookie: ISessionCookie) => void;
  clear: (request: KibanaRequest) => void;
}

export class SessionStorage implements ISessionStorage {
  private sessionStorageFactory: SessionStorageFactory<ISessionCookie>;

  constructor(sessionStorageFactory: SessionStorageFactory<ISessionCookie>) {
    this.sessionStorageFactory = sessionStorageFactory;
  }

  get(request: KibanaRequest) {
    return this.sessionStorageFactory.asScoped(request).get();
  }

  set(request: KibanaRequest, sessionCookie: ISessionCookie) {
    this.sessionStorageFactory.asScoped(request).set(sessionCookie);
  }

  clear(request: KibanaRequest) {
    this.sessionStorageFactory.asScoped(request).clear();
  }
}