import _ from "lodash";
import {
  buildPermissionsFromCapabilities,
  getPermissionsResult,
  toggleUiCapabilities,
  UICAPABILITY_PREFIX
} from "./rbac_permissions";

export function handleUICapabilities(server, searchguardBackend) {
  server.registerCapabilitiesModifier(async (request, uiCapabilities) => {

    // We need to have an authenticated user to perform the hasPermissions check
    if (! request.path.startsWith('/app')) {
      return uiCapabilities;
    }

    const capabilities = _.cloneDeep(uiCapabilities);
    let appPermissions = buildPermissionsFromCapabilities(capabilities);

    let appPermissionsResult = await getPermissionsResult(searchguardBackend, request, appPermissions);
    const capabilitiesAfterPermissionsCheck = toggleUiCapabilities(capabilities, appPermissionsResult);

    // @todo This may be redundant, and instead we could use route.requireUiCapability
    const id = request.params.id;
    const app = server.getUiAppById(id) || server.getHiddenUiAppById(id);

    if (app) {
      // Make sure we can pass the result back to the frontend.
      // Checking the injectedAppVars is a bit overkill right now,
      // but I wanted to make sure we don't overwrite anything in the future.
      // This code is executed before the replaceInjectedVars()
      // in the plugin definition.

      // @todo This looks like we're overwriting existing sgDynamic, no?
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
          .filter(permissionString => permissionString.indexOf(UICAPABILITY_PREFIX + 'navLinks') === 0)
          .map(permissionString => permissionString.replace(UICAPABILITY_PREFIX + 'navLinks/', ''))
      }

      server.injectUiAppVars(app.getId(), (server) => {
        return {
          sgDynamic
        }
      });
    }

    return capabilitiesAfterPermissionsCheck;
  });
}