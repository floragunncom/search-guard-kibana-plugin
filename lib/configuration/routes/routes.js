import Boom from 'boom';
import Joi from 'joi';
import Resources from './../resources';

/**
 * The backend API allows to manage the backend configuration.
 *
 * NOTE: All routes are POST since the REST API requires an admin certificat to access
 *
 */
export default function (pluginRoot, server, APP_ROOT, API_ROOT) {

  const config = server.config();
  //const adminRole = config.get('kibi_access_control.admin_role');

  // todo: what is this?
  const adminRole = 'admin';

  // todo: remove, make constant
  function getAuthenticationBackend(request) {
    return server.plugins.searchguard.getSearchGuardConfigurationBackend();
  }

  /**
   * Returns a resource name from a path parameter.
   *
   * @param {String} pathParameter - An HAPI path parameter.
   */
  // TODO: get rid of resources mapping, or do it once
  function getResourceFromPath(pathParameter) {
    switch (pathParameter) {
      case 'config':
        return Resources.CONFIG;
      case 'internalusers':
        return Resources.INTERNAL_USER;
      case 'roles':
        return Resources.ROLE;
      case 'rolemappings':
        return Resources.ROLEMAPPING;
      case 'actiongroups':
        return Resources.ACTIONGROUP;
      default:
        throw new Error('Unknown resource');
    }
  }


  /**
   * Returns a list of resource instances.
   *
   */
  server.route({
    method: 'POST',
    path: `${API_ROOT}/configuration/get/{resourceName}`,
    handler: {
      async: async (request, reply) => {

        var certificates = request.payload.certificates;

        const backend = getAuthenticationBackend(request);

        try {
          const results = await backend.list(getResourceFromPath(request.params.resourceName), certificates);
          return reply({
            total: Object.keys(results).length,
            data: results
          });
        } catch (error) {
          if (error.isBoom) {
            return reply(error);
          }
          throw error;
        }
      }
    },
    config: {
      validate: {
        params: {
          resourceName: Joi.string().required()
        }
      }
    }
  });

  /**
   * Returns a resource instance.
   *
   * Response sample:
   *
   * {
   *   "id": "kibiuser",
   * }
   */
  server.route({
    method: 'POST',
    path: `${API_ROOT}/configuration/get/{resourceName}/{id}`,
    handler: {
      async: async (request, reply) => {
        var certificates = request.payload.certificates;
        try {
          const backend = getAuthenticationBackend(request);
          const resource = getResourceFromPath(request.params.resourceName);
          const instance = await backend.get(resource, request.params.id, certificates);
          return reply(instance);
        } catch (error) {
          if (error.name === 'NotFoundError') {
            return reply(Boom.notFound(`${request.params.id} not found.`));
          } else {
            if (error.isBoom) {
              return reply(error);
            }
            throw error;
          }
        }
      }
    },
    config: {
      validate: {
        params: {
          resourceName: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    }
  });

  /**
   * Deletes a resource instance.
   *
   * Response sample:
   *
   * {
   *   "message": "Deleted user username"
   * }
   */
  server.route({
    method: 'POST',
    path: `${API_ROOT}/configuration/delete/{resourceName}/{id}`,
    handler: {
      async: async (request, reply) => {
        var certificates = request.payload.certificates;
        try {
          const backend = getAuthenticationBackend(request);
          const response = await backend.delete(getResourceFromPath(request.params.resourceName), request.params.id,certificates);
          return reply({
            message: response.message
          });
        } catch (error) {
          if (error.name === 'NotFoundError') {
            return reply(Boom.notFound(`${request.params.id} not found.`));
          }
          throw error;
        }
      }
    },
    config: {
      validate: {
        params: {
          resourceName: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    }
  });


  /**
   * Updates or creates a resource
   *
   * Request sample:
   *
   * {
   *   "password": "password"
   * }
   */
  server.route({
    method: 'POST',
    path: `${API_ROOT}/configuration/save/{resourceName}/{id}`,
    handler: {
      async: async (request, reply) => {
        const backend = getAuthenticationBackend(request);
        try {
          const response = await backend.save(getResourceFromPath(request.params.resourceName), request.params.id, request.payload.data, request.payload.certificates);
          return reply({
            message: response.message
          });
        } catch (error) {
          if (error.isBoom) {
            return reply(error);
          }
          throw error;
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: `${API_ROOT}/configuration/clearcache`,
    handler: {
      async: async (request, reply) => {
        var certificates = request.payload.certificates;
        try {
          const backend = getAuthenticationBackend(request);
          const response = await backend.clearCache(certificates);
          return reply({
            message: response.message
          });
        } catch (error) {
          if (error.name === 'NotFoundError') {
            return reply(Boom.notFound(`${request.params.id} not found.`));
          }
          throw error;
        }
      }
    }
  });

}

