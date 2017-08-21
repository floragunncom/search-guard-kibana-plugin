import Boom from 'boom';
import Joi from 'joi';
import Resources from './../resources';

/**
 * The backend API allows to manage the backend configuration.
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


  //server.route({
  //  method: 'GET',
  //  path: `${API_ROOT}/v1/configuration/{resourceName}`,
  //  handler(request, reply) {
  //    return reply("Hallo");
  //  //},
  //  //config: {
  //  //  validate: {
  //  //    params: {
  //  //      resourceName: Joi.string().required()
  //  //    }
  //  //  }
  //    //,plugins: {
  //    //  hapiAuthorization: {
  //    //    role: adminRole
  //    //  }
  //    //}
  //  }
  //});

  /**
   * Returns a list of resource instances.
   *
   */
  server.route({
    method: 'GET',
    path: `${API_ROOT}/configuration/{resourceName}`,
    handler: {
      async: async (request, reply) => {
        const backend = getAuthenticationBackend(request);
        try {
          const results = await backend.list(getResourceFromPath(request.params.resourceName));
          console.log(results);
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
      //plugins: {
      //  hapiAuthorization: {
      //    role: adminRole
      //  }
      //}
    }
  });



  //server.route({
  //  method: 'GET',
  //  path: `${API_ROOT}/configuration/{resourceName}`,
  //  handler(request, reply) {
  //    const backend = getAuthenticationBackend(request);
  //    try {
  //      const results = backend.list(getResourceFromPath(request.params.resourceName));
  //      return reply({
  //          result: results
  //      });
  //    } catch (error) {
  //      if (error.isBoom) {
  //        return reply(error);
  //      }
  //      throw error;
  //    }
  //  },
  //  config: {
  //    validate: {
  //      params: {
  //        resourceName: Joi.string().required()
  //      }
  //    }
  //    //,plugins: {
  //    //  hapiAuthorization: {
  //    //    role: adminRole
  //    //  }
  //    //}
  //  }
  //});

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
    method: 'GET',
    path: `${API_ROOT}/configuration/{resourceName}/{id}`,
    handler: {
      async: async (request, reply) => {
        try {
          const backend = getAuthenticationBackend(request);
          const resource = getResourceFromPath(request.params.resourceName);
          const instance = await backend.get(resource, request.params.id);
          //
          //let repr;
          //switch (resource) {
          //  case Resources.ROLE:
          //  case Resources.ACTIONGROUP:
          //    repr = {
          //      id: request.params.id,
          //      permissions: instance
          //    };
          //    break;
          //  case Resources.ROLEMAPPING:
          //    repr = {
          //      id: request.params.id,
          //      users: instance.users,
          //      hosts: instance.hosts,
          //      backendroles: instance.backendroles
          //    };
          //    break;
          //  default:
          //    repr = {
          //      id: request.params.id
          //    };
          //    break;
          //}
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
      //,plugins: {
      //  hapiAuthorization: {
      //    role: adminRole
      //  }
      //}
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
    method: 'DELETE',
    path: `${API_ROOT}/configuration/{resourceName}/{id}`,
    handler: {
      async: async (request, reply) => {
        try {
          const backend = getAuthenticationBackend(request);
          const response = await backend.delete(getResourceFromPath(request.params.resourceName), request.params.id);
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
    //  ,
    //  plugins: {
    //    hapiAuthorization: {
    //      role: adminRole
    //    }
    //  }
    }
  });

  server.route({
    method: 'DELETE',
    path: `${API_ROOT}/configuration/clearcache`,
    handler: {
      async: async (request, reply) => {
        try {
          const backend = getAuthenticationBackend(request);
          const response = await backend.clearCache();
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
    //,
    //config: {
    //  validate: {
    //    params: {
    //      resourceName: Joi.string().required(),
    //      id: Joi.string().required()
    //    }
    //  }
      //  ,
      //  plugins: {
      //    hapiAuthorization: {
      //      role: adminRole
      //    }
      //  }
    //}
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
    method: ['PUT'],
    path: `${API_ROOT}/configuration/{resourceName}/{id}`,
    handler: {
      async: async (request, reply) => {
        const backend = getAuthenticationBackend(request);
        try {
          const response = await backend.save(getResourceFromPath(request.params.resourceName), request.params.id, request.payload);
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
    //,
    //config: {
    //  validate: {
    //    params: {
    //      username: Joi.string().required()
    //    },
    //    payload: {
    //      password: Joi.string().default(null)
    //    }
    //  }
      //,
      //plugins: {
      //  hapiAuthorization: {
      //    role: adminRole
      //  }
      //}
    //}
  });

  ///**
  // * Creates a new role.
  // *
  // * Request sample:
  // *
  // * {
  // *   "id": "clusteradmin",
  // *   "permissions": {
  // *     "cluster": [
  // *       "*"
  // *     ]
  // *   }
  // * }
  // */
  //server.route({
  //  method: ['POST'],
  //  path: `${API_ROOT}/configuration/roles`,
  //  handler: {
  //
  //    async: async (request, reply) => {
  //      const backend = getAuthenticationBackend(request);
  //      try {
  //        const response = await backend.create(Resources.ROLE, request.payload.id, request.payload.permissions);
  //        return reply({
  //          message: response.message
  //        });
  //      } catch (error) {
  //        if (error.name === 'ConflictError') {
  //          return reply(Boom.conflict(`${request.payload.id} already exists.`));
  //        }
  //        throw error;
  //      }
  //    }
  //  },
  //  config: {
  //    validate: {
  //      payload: {
  //        id: Joi.string().required(),
  //        permissions: Joi.object().keys({
  //          cluster: Joi.array().items(Joi.string()).default(null),
  //          indices: Joi.object()
  //        })
  //      }
  //    },
  //    plugins: {
  //      hapiAuthorization: {
  //        role: adminRole
  //      }
  //    }
  //  }
  //});
  //
  ///**
  // * Updates a role.
  // *
  // * Request sample:
  // *
  // * {
  // *   "permissions": {
  // *     "cluster": [
  // *       "*"
  // *     ]
  // *   }
  // * }
  // */
  //server.route({
  //  method: ['PUT'],
  //  path: `${API_ROOT}/configuration/roles/{id}`,
  //  handler: {
  //    async: async (request, reply) => {
  //      const backend = getAuthenticationBackend(request);
  //      const response = await backend.update(Resources.ROLE, request.params.id, request.payload.permissions);
  //      return reply({
  //        message: response.message
  //      });
  //    }
  //  },
  //  config: {
  //    validate: {
  //      params: {
  //        id: Joi.string().required()
  //      },
  //      payload: {
  //        permissions: Joi.object().keys({
  //          cluster: Joi.array().items(Joi.string()).default(null),
  //          indices: Joi.object()
  //        })
  //      }
  //    },
  //    plugins: {
  //      hapiAuthorization: {
  //        role: adminRole
  //      }
  //    }
  //  }
  //});
  //
  ///**
  // * Creates a new rolemapping.
  // *
  // * Request sample:
  // *
  // * {
  // *   "id": "kibiadmin",
  // *   "users": ["kibiadmin"]
  // * }
  // */
  //server.route({
  //  method: ['POST'],
  //  path: `${API_ROOT}/configuration/rolemappings`,
  //  handler: {
  //
  //    async: async (request, reply) => {
  //      const backend = getAuthenticationBackend(request);
  //      try {
  //        const response = await backend.create(Resources.ROLEMAPPING, request.payload.id, {
  //          users: request.payload.users,
  //          backendroles: request.payload.backendroles,
  //          hosts: request.payload.hosts
  //        });
  //        return reply({
  //          message: response.message
  //        });
  //      } catch (error) {
  //        if (error.name === 'ConflictError') {
  //          return reply(Boom.conflict(`${request.payload.id} already exists.`));
  //        }
  //        if (error.isBoom) {
  //          return reply(error);
  //        }
  //        throw error;
  //      }
  //    }
  //  },
  //  config: {
  //    validate: {
  //      payload: {
  //        id: Joi.string().required(),
  //        users: Joi.array().items(Joi.string()).default([]),
  //        backendroles: Joi.array().items(Joi.string()).default([]),
  //        hosts: Joi.array().items(Joi.string()).default([])
  //      }
  //    },
  //    plugins: {
  //      hapiAuthorization: {
  //        role: adminRole
  //      }
  //    }
  //  }
  //});
  //
  ///**
  // * Updates a rolemapping.
  // *
  // * Request sample:
  // *
  // * {
  // *   "users": ["kibiadmin"]
  // * }
  // */
  //server.route({
  //  method: ['PUT'],
  //  path: `${API_ROOT}/configuration/rolemappings/{id}`,
  //  handler: {
  //    async: async (request, reply) => {
  //      const backend = getAuthenticationBackend(request);
  //      try {
  //        const response = await backend.update(Resources.ROLEMAPPING, request.params.id, request.payload);
  //        return reply({
  //          message: response.message
  //        });
  //      } catch (error) {
  //        if (error.isBoom) {
  //          return reply(error);
  //        }
  //        throw error;
  //      }
  //    }
  //  },
  //  config: {
  //    validate: {
  //      params: {
  //        id: Joi.string().required()
  //      },
  //      payload: {
  //        users: Joi.array().items(Joi.string()).default([]),
  //        backendroles: Joi.array().items(Joi.string()).default([]),
  //        hosts: Joi.array().items(Joi.string()).default([])
  //      }
  //    },
  //    plugins: {
  //      hapiAuthorization: {
  //        role: adminRole
  //      }
  //    }
  //  }
  //});
  //
  ///**
  // * Creates a new action group.
  // *
  // * Request sample:
  // *
  // * {
  // *   "id": "HEALTH",
  // *   "permissions": [
  // *     "cluster/health"
  // *   ]
  // * }
  // */
  //server.route({
  //  method: ['POST'],
  //  path: `${API_ROOT}/configuration/actiongroups`,
  //  handler: {
  //
  //    async: async (request, reply) => {
  //      const backend = getAuthenticationBackend(request);
  //      try {
  //        const response = await backend.create(Resources.ACTIONGROUP, request.payload.id, {permissions: request.payload.permissions});
  //        return reply({
  //          message: response.message
  //        });
  //      } catch (error) {
  //        if (error.name === 'ConflictError') {
  //          return reply(Boom.conflict(`${request.payload.id} already exists.`));
  //        }
  //        throw error;
  //      }
  //    }
  //  },
  //  config: {
  //    validate: {
  //      payload: {
  //        id: Joi.string().required(),
  //        permissions: Joi.array().items(Joi.string()).min(1)
  //      }
  //    },
  //    plugins: {
  //      hapiAuthorization: {
  //        role: adminRole
  //      }
  //    }
  //  }
  //});
  //
  ///**
  // * Updates an action group.
  // *
  // * Request sample:
  // *
  // * {
  // *   "permissions": [
  // *     "cluster/health"
  // *   ]
  // * }
  // */
  //server.route({
  //  method: ['PUT'],
  //  path: `${API_ROOT}/configuration/actiongroups/{id}`,
  //  handler: {
  //    async: async (request, reply) => {
  //      const backend = getAuthenticationBackend(request);
  //      const response = await backend.update(Resources.ACTIONGROUP, request.params.id, request.payload);
  //      return reply({
  //        message: response.message
  //      });
  //    }
  //  },
  //  config: {
  //    validate: {
  //      params: {
  //        id: Joi.string().required()
  //      },
  //      payload: {
  //        permissions: Joi.array().items(Joi.string()).min(1)
  //      }
  //    },
  //    plugins: {
  //      hapiAuthorization: {
  //        role: adminRole
  //      }
  //    }
  //  }
  //});

}

