import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Internal users API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendInternalUsers', function (backendAPI, Promise, $http) {

        const RESOURCE = 'internalusers';

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
            user.attributes = [];
            return user;
        };

        this.preSave = (user) => {
            delete user["passwordConfirmation"];
            // remove empty roles
            user.roles = user.roles.filter(e => String(e).trim());
            // remove duplicate roles
            user.roles = uniq(user.roles);

            // attribiutes
            user["attributes"] = {};
            for (var i = 0, l = user.attributesArray.length; i < l; i++) {
                var entry = user.attributesArray[i];
                if (entry && entry.key != "") {
                    user.attributes[entry.key] = entry.value;
                }
            }
            delete user["attributesArray"];
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
            // transform user attributes to object
            user["attributesArray"] = [];
            if (user.attributes) {
                var attributeNames = Object.keys(user.attributes).sort();
                attributeNames.forEach(function(attributeName){

                    user.attributesArray.push(
                        {
                            key: attributeName,
                            value: user.attributes[attributeName]
                        }
                    );
                });
            }
            return user;
        };

    });
