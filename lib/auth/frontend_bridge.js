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

/**
 * The injectedVarsReplacers is a Kibana function that
 * allows you to push data to the frontend. These values
 * will be available to all apps, accessible through chrome.getInjected(...)
 *
 *
 * @param server
 * @param config
 * @param injectedVarsReplacers
 * @returns {*}
 */
export default function(server, config, injectedVarsReplacers) {
    return {
        type: 'onPostAuth',
        method: async function(request, reply) {

            if (! injectedVarsReplacers) {
                return reply.continue();
            }

            const authType = config.get('searchguard.auth.type');

            let sgVarReplacer = async function(injectedVars) {

                let userInfo = null;

                // If the user is authenticated, just get the regular values
                if(request.auth.sgSessionStorage.isAuthenticated()) {
                    let sessionCredentials = request.auth.sgSessionStorage.getSessionCredentials();
                    userInfo = {
                        username: sessionCredentials.username,
                        isAnonymousAuth: sessionCredentials.isAnonymousAuth
                    };
                } else if (['', 'kerberos', 'proxy'].indexOf(authType) > -1) {
                    // We should be able to use this with kerberos and proxy too
                    try {
                        let authInfo = await request.auth.sgSessionStorage.getAuthInfo();
                        userInfo = {
                            username: authInfo.user_name
                        };
                    } catch(error) {
                        // Not authenticated, so don't do anything
                    }
                }

                // Make sure the parent object is always available
                injectedVars.sgDynamic = {};

                if (userInfo) {
                    injectedVars.sgDynamic.user = userInfo
                }

                return injectedVars;
            };

            // Only do this if this is a regular page load (i.e. no ajax, no images etc.)
            if (request.headers && request.headers.accept && typeof request.headers.accept === 'string' && request.headers.accept.indexOf('text/html') > -1) {
                // Unfortunately, for each request a new replacer is added. To avoid having a bunch of
                // replacers doing the same thing, we need to delete the old ones.
                // We can't keep the original (first) replacer, because it will always have a reference
                // to the request for which it was added it seems.
                // @todo Check if we can improve that.
                let oldReplacer = injectedVarsReplacers.filter(replacer => replacer.name === 'sgVarReplacer');
                if (oldReplacer.length) {
                    let indexToRemove = injectedVarsReplacers.indexOf(oldReplacer[0]);
                    if (indexToRemove > -1) {
                        injectedVarsReplacers.splice(indexToRemove, 1);
                    }
                }

                injectedVarsReplacers.push(sgVarReplacer);
            }

            return reply.continue();

        }
    }
}