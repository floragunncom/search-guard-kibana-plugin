/**
 * The different actions, as per https://www.elastic.co/guide/en/kibana/master/saved-objects-api.html
 * @type {{CREATE: string, BULK_CREATE: string, FIND: string, GET: string, BULK_GET: string, UPDATE: string, DELETE: string}}
 */
const ACTIONS = {
    CREATE: 'create',
    BULK_CREATE: 'bulk_create',
    FIND: 'find',
    GET: 'get',
    BULK_GET: 'bulk_get', // @todo Why the snake case here? What do our permissions look like
    UPDATE: 'update',
    'DELETE': 'delete',
};

export default class SearchguardSavedObjectsClient {
    constructor(request, searchguardBackend, settings) {
        this.request = request;
        this.searchguardBackend = searchguardBackend;

        this.errors = settings.errors;
        this.callWithRequestRepository = settings.callWithRequestRepository;

        this.savedObjectTypes = settings.savedObjectsTypes;
    }

    async create(type, attributes = {}, options = {}) {
        return await this.authorize(
            type,
            ACTIONS.CREATE,
            repository => repository.create(type, attributes, options)
        );
    }

    async bulkCreate(objects, options = {}) {
        let types = [];
        objects.forEach((object) => {
           if (types.indexOf(object.type) === -1) {
               types.push(object.type);
           }
        });

        return await this.authorize(
            types,
            ACTIONS.BULK_CREATE,
            repository => repository.bulkCreate(objects, options)
        );
    }

    async find(options = {}) {
        if (options.type) {
            return await this.findWithType(options);
        } else {
            return await this.findWithAllTypes(options);
        }
    }

    async findWithType(options) {
        return await this.authorize(
            options.type,
            ACTIONS.FIND,
            repository => repository.find(options)
        );
    }

    /**
     * Find across all types that the user has permissions for
     * @param options
     * @returns {Promise<*>}
     */
    async findWithAllTypes(options) {
        // We don't have any requested types here, so we use the list with all saved object types.
        const permissionsInfo = this.getPermissionInfo(this.savedObjectTypes, ACTIONS.FIND);
        const permissionsParameter = permissionsInfo.permissionNames.join(',');
        const permissionsResult = await this.checkPermissions(permissionsParameter);

        let findOptions = {
            ...options
        };

        if (permissionsResult.allowedTypes.length === 0) {
            throw this.errors.decorateForbiddenError(new Error('Unauthorized: find not allowed for any saved object type'))
        } else {
            findOptions.type = permissionsResult.allowedTypes;
        }

        // @todo Test this
        console.log('RBAC: Calling with findAllTypes', findOptions);

        return await this.callWithRequestRepository.find(findOptions);
    }

    async get(type, id) {
        return await this.authorize(
            type,
            ACTIONS.GET,
            repository => repository.get(type, id)
        );
    }

    async bulkGet(objects = []) {
        let types = [];
        objects.forEach((object) => {
            if (types.indexOf(object.type) === -1) {
                types.push(object.type);
            }
        });
        return await this.authorize(
            types,
            ACTIONS.BULK_GET,
            repository => repository.bulkGet(objects)
        );
    }

    async update(type, id, attributes, options = {}) {
        return await this.authorize(
            type,
            ACTIONS.UPDATE,
            repository => repository.update(type, id, attributes, options)
        )
    }

    async delete(type, id) {
        return await this.authorize(
            type,
            ACTIONS['DELETE'],
            repository => repository.delete(type, id)
        );
    }

    /**
     * Convert type and action to a permission name
     * @param action
     * @param type
     * @returns {string}
     */
    buildPermissionName(action, type) {
        return `kibana:saved_objects/${type}/${action}`;
    }

    /**
     * Normalize the info that we need to perform a permission request
     * @param type
     * @param action
     * @returns {{types: *[], permissionNames: any[], permissionToType, permissionsParameter: string}}
     */
    getPermissionInfo(type, action) {
        const types = Array.isArray(type) ? type : [type];
        let permissionToType = {};
        const permissionNames = types.map((type) => {
            const permissionName = this.buildPermissionName(action, type);
            permissionToType[permissionName] = type;
            return permissionName;;
        });

        return {
            types,
            permissionNames,
            permissionToType,
            permissionsParameter: permissionNames.join(',')
        };
    }

    /**
     * Build the data for the permissions request and handle the response
     * @param type
     * @param action
     * @param clientCallback
     * @returns {Promise<*>}
     */
    async authorize(type, action, clientCallback) {
        const permissionsInfo = this.getPermissionInfo(type, action);
        const permissionsResult = await this.checkPermissions(permissionsInfo.permissionsParameter, permissionsInfo.permissionToType);

        if (permissionsResult.hasAllPermissions !== true) {
            const errorMessage = `Unauthorized: ${action} for ${permissionsInfo.types.join(', ')}, missing permissions: ${permissionsResult.missingPermissions.join(', ')}`;
            throw this.errors.decorateForbiddenError(new Error(errorMessage));
        } else {
            return await clientCallback(this.callWithRequestRepository);
        }
    }

    /**
     * Call the sg backend and normalize the response
     * @param permissionsParameter
     * @param permissionToType
     * @returns {Promise<{hasAllPermissions: boolean, missingPermissions: Array, missingTypes: Array, allowedTypes: Array}>}
     */
    async checkPermissions(permissionsParameter, permissionToType) {
        try {
            const backendResult = await this.searchguardBackend.hasPermissions(this.request.headers, permissionsParameter);

            let checkResult = {
                hasAllPermissions: false,
                missingPermissions: [],
                missingTypes: [],
                allowedTypes: [],
            };

            // Go through the response for each permission
            for (let permission in backendResult.permissions) {
                let permissionType = permissionToType[permission];
                if (backendResult.permissions[permission] !== true) {
                    checkResult.missingPermissions.push(permission);
                    checkResult.missingTypes.push(permissionType);
                } else if (backendResult.permissions[permission] === true) {
                    checkResult.allowedTypes.push(permissionType)
                }
            }

            if (checkResult.missingPermissions.length) {
                checkResult.hasAllPermissions = false;
                return checkResult;
            } else {
                checkResult.hasAllPermissions = true;
                return checkResult;
            }

        } catch (error) {
            throw this.errors.decorateGeneralError(error, 'Could not check for application permissions');
        }
    }

}