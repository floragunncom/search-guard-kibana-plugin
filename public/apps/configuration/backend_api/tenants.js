import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Tenants API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendTenants', function (backendAPI, Promise, $http, kbnUrl) {

        const RESOURCE = 'tenants';

        this.title = {
            singular: 'tenant',
            plural: 'tenants'
        };

        this.newLabel = "Tenant name";

        this.list = () => {
            return backendAPI.list(RESOURCE);
        };

        this.listSilent = () => {
            return backendAPI.listSilent(RESOURCE);
        };

        this.get = (id) => {
            return backendAPI.get(RESOURCE, id);
        };

        this.save = (tenantName, data, doPreSave = false) => {
            var data = doPreSave ? this.preSave(data) : data;
            return backendAPI.save(RESOURCE, encodeURIComponent(tenantName), data);
        };

        this.delete = (id) => {
          return backendAPI.delete(RESOURCE, encodeURIComponent(id));
        };

        this.listAutocomplete = (names) => {
            return backendAPI.listAutocomplete(names);
        };

        this.emptyModel = () => {
            var tenant = {};
            tenant.description = "";
            return tenant;
        };

        this.preSave = (tenant) => {
            delete tenant.hidden;
            delete tenant.reserved;
            delete tenant.static;

            return tenant;
        };

        this.postFetch = (tenant) => {
            return tenant;
        };

    });