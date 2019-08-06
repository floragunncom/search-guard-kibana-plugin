/**
 *    Copyright 2019 floragunn GmbH

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

export default function (pluginRoot, server) {

    server.ext('onPostAuth', async function(request, h) {

        // Only do this for apps
        if (! request.path.startsWith('/app')) {
            return h.continue;
        }

        try {

            console.log('----- Running things in extension')

            const id = request.params.id;
            const app = server.getUiAppById(id) || server.getHiddenUiAppById(id);

            let appPermissionsResult = {
                allowed: ['searchguard-configuration']
            }

            if (app) {
                // Make sure we can pass the result back to the frontend.
                // Checking the injectedAppVars is a bit overkill right now,
                // but I wanted to make sure we don't overwrite anything in the future.
                // This code is executed before the replaceInjectedVars()
                // in the plugin definition.
                let sgDynamic = {
                    rbac: {}
                };
                let injectedAppVars = await server.getInjectedUiAppVars(app.getId());
                if (injectedAppVars && injectedAppVars.sgDynamic) {
                    sgDynamic = injectedAppVars.sgDynamic;
                }

                sgDynamic.rbac = {
                    ...sgDynamic.rbac,
                    allowedNavLinkIds: appPermissionsResult.allowed
                }

                server.injectUiAppVars(app.getId(), (server) => {
                    return {
                        sgDynamic
                    }
                });

                // We may need to redirect if the user is trying to open an app that isn't allowed.
                // We have to let the Kibana app through because it consists of multiple apps and
                // we don't have the distinction between kibana:dashboard, kibana:visualize etc.
                // at this point. The different Kibana apps are instead handled by the frontend
                if (app.getId() != 'kibana' && appPermissionsResult.allowed.indexOf(app.getId()) === -1) {
                    //return h.redirect('/app/kibana').takeover();
                }
            }
        } catch(error) {
            server.log(['searchguard', 'error'], `An error occurred while checking RBAC permissions`);
        }

        return h.continue;
    });
}