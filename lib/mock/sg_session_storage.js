// TODO: delete this file when sgSessionStorage plugin code is refactored to testable code
export default class SgSessionStorage {
  authenticateWithHeaders() {
    return {
      "session": {
        "username": "admin",
        "credentials": {},
        "authType": "basicauth",
        "assignAuthHeader": false,
        "expiryTime": 1563530520086,
        "additionalAuthHeaders": null
      },
      "user": {
        "_username": "admin",
        "_credentials": {},
        "_proxyCredentials": null,
        "_roles": [
          "SGS_ALL_ACCESS",
          "SGS_OWN_INDEX"
        ],
        "_selectedTenant": null,
        "_backendroles": [
          "admin"
        ],
        "_tenants": {
          "admin_tenant": true,
          "admin": true,
          "wewe": true,
          "SGS_GLOBAL_TENANT": true
        }
      }
    };
  }
}
