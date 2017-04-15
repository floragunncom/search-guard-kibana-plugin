/**
 *    Copyright 2016 floragunn GmbH

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

import { assign } from 'lodash';
import InvalidSessionError from './invalid_session_error';

export default function (server) {

  const config = server.config();
  const sessionTTL = config.get('searchguard.session.ttl');
  const sessionKeepAlive = config.get('searchguard.session.keepalive');

  return function validate(request, session, callback) {
    try {
      const backend = server.plugins.searchguard.getSearchGuardBackend();
      if (sessionTTL) {
        if (!session.expiryTime || session.expiryTime < Date.now()) {
          return callback(new InvalidSessionError('Session expired.'), false);
        }
      }
      backend.authenticate(session.credentials).then((user) => {
        if (sessionTTL && sessionKeepAlive) {
          let extendedSession = {};
          assign(extendedSession, session);
          extendedSession.expiryTime = Date.now() + sessionTTL;
          request.auth.session.set(extendedSession);
        }
        return callback(null, true, user);
      }).catch((error) => {
        return callback(new InvalidSessionError('Invalid session.', error), false);
      });
    } catch (error) {
      return callback(new InvalidSessionError('Invalid session', error), false);
    }
  };

};
