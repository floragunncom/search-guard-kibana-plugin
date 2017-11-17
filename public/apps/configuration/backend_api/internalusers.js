import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Internal users API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendInternalUsers', function (backendAPI, Promise, $http, createNotifier) {

        const RESOURCE = 'internalusers';

        const notify = createNotifier({});

        this.title = {
            singular: 'internal user',
            plural: 'internal users'
        };

        this.newLabel = "Username";

        this.list = () => {
            return backendAPI.list(RESOURCE);
        };

        this.get = (username) => {
            return backendAPI.get(RESOURCE, username);
        };

        this.save = (username, data) => {
            data = this.preSave(data);
            return backendAPI.save(RESOURCE, username, data);
        };

        this.delete = (username) => {
            return backendAPI.delete(RESOURCE, username);
        };

        this.emptyModel = () => {
            var user = {};
            user["password"] = "";
            user["passwordConfirmation"] = "";
            user.roles = [];
            return user;
        };

        this.preSave = (user) => {
            delete user["passwordConfirmation"];
            // remove empty roles
            user.roles = user.roles.filter(e => String(e).trim());
            // remove duplicate roles
            user.roles = uniq(user.roles);
            return user;
        };

        this.postFetch = (user) => {
            user = backendAPI.cleanArraysFromDuplicates(user);
            delete user["hash"];
            user["password"] = "";
            user["passwordConfirmation"] = "";
            if (!user.roles) {
                user.roles = [];
            }
            return user;
        };

    });
