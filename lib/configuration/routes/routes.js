import Boom from 'boom';
import Joi from 'joi';
import Resources from './../resources';

/**
 * The backend API allows to manage the backend configuration.
 *
 * All routes are POST since the REST API requires an admin certificat to access
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


  server.route({
    method: 'POST',
    path: `${API_ROOT}/configuration/certificates`,
    handler: (request, reply) => {
      var certificates = request.payload;

      var test = "{ certificate: '\nKeystore type: JKS\nKeystore provider: SUN\n\nYour keystore contains 1 entry\n\nAlias name: kirk\nCreation date: May 4, 2016\nEntry type: PrivateKeyEntry\nCertificate chain length: 3\nCertificate[1]:\n-----BEGIN CERTIFICATE-----\nMIID2jCCAsKgAwIBAgIBBTANBgkqhkiG9w0BAQUFADCBlTETMBEGCgmSJomT8ixkARkWA2NvbTEX\r\nMBUGCgmSJomT8ixkARkWB2V4YW1wbGUxGTAXBgNVBAoMEEV4YW1wbGUgQ29tIEluYy4xJDAiBgNV\r\nBAsMG0V4YW1wbGUgQ29tIEluYy4gU2lnbmluZyBDQTEkMCIGA1UEAwwbRXhhbXBsZSBDb20gSW5j\r\nLiBTaWduaW5nIENBMB4XDTE2MDUwNDIwNDUzNFoXDTE4MDUwNDIwNDUzNFowTTELMAkGA1UEBhMC\r\nREUxDTALBgNVBAcTBFRlc3QxDzANBgNVBAoTBmNsaWVudDEPMA0GA1UECxMGY2xpZW50MQ0wCwYD\r\nVQQDEwRraXJrMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh0WcM8BpT9hby6BMzXg7\r\ntl5zhfq2pu61j0+n8SPiSa90g89Zks4sU3h6vNj+QO0S3TFC30BTH0D361l4AeKn4rLg0rfgj6HG\r\nUX1KqoRpTBtpfC4CTK+fLZ9AB72rrzU3ohpcl8tEocR2wyikCjK1rP0S/pvJCd1ZJ/zRTWylgNNg\r\n0Bx5s2Avkl01HQHI+0TQ2Tuaqn81lhqcNzjbADXQxMVa3xE5YaDbWTFbuDoEINWGPMZisku4bElg\r\nJCYkN/2mF91zS2dfaZ0XqaxpCB2k+t+CAY103kgM1nozpX5yfCGBG2r6lFAZL0o7Biiit170STiR\r\nBWUFsgSlDUKjkd8/owIDAQABo3wwejAOBgNVHQ8BAf8EBAMCBaAwCQYDVR0TBAIwADAdBgNVHSUE\r\nFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwHQYDVR0OBBYEFAAHm5Sk4Puz5rovVzCej/+/dmBEMB8G\r\nA1UdIwQYMBaAFDUDIxMwMCEfj73z317BsKkgiCywMA0GCSqGSIb3DQEBBQUAA4IBAQBp5INg3U9Z\r\n3fD/LL5TbAJGvfhKoUzOiKl3PD81Q7Ga26rSf+LK7vudP/ejxfyZCQhTFDhZwLRiylk+ibSokjSI\r\nIUobNRxZpqp48pvPO79mlbq2PZL0sgppZ/h2yk6OuZ+oBSDfFgyPNNgjxZl1xiEurvotwiQ93xmV\r\nyVdwli8ylqArBQlILEDUbYi9xPP3TRW2CBhWZ7vN9c+60Xe3URkTvS747APehWJc+kS06TgOk4kz\r\nBLAZ7KkqbcrobCXJf2Vr5KLs6l6Ja1Gd/wNGGdPe4C1Hh2fnArjNCfeM9gy35mx7vygyJSGvXqNL\r\noYcu53yJ+YWSkUVwecjl0mVWwbTj\n-----END CERTIFICATE-----\nCertificate[2]:\n-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgIBAjANBgkqhkiG9w0BAQUFADCBjzETMBEGCgmSJomT8ixkARkWA2NvbTEX\r\nMBUGCgmSJomT8ixkARkWB2V4YW1wbGUxGTAXBgNVBAoMEEV4YW1wbGUgQ29tIEluYy4xITAfBgNV\r\nBAsMGEV4YW1wbGUgQ29tIEluYy4gUm9vdCBDQTEhMB8GA1UEAwwYRXhhbXBsZSBDb20gSW5jLiBS\r\nb290IENBMB4XDTE2MDUwNDIwNDUyNloXDTI2MDUwNDIwNDUyNlowgZUxEzARBgoJkiaJk/IsZAEZ\r\nFgNjb20xFzAVBgoJkiaJk/IsZAEZFgdleGFtcGxlMRkwFwYDVQQKDBBFeGFtcGxlIENvbSBJbmMu\r\nMSQwIgYDVQQLDBtFeGFtcGxlIENvbSBJbmMuIFNpZ25pbmcgQ0ExJDAiBgNVBAMMG0V4YW1wbGUg\r\nQ29tIEluYy4gU2lnbmluZyBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALt5tiuC\r\noGls5xRSU+j2tUhpqjnjRdjC9KcHbus90J6ZUucc9b14sP4+GwzFKWy0P95gUvdb3q1NfLz8GFXg\r\nJr2WL8q01rwHrWarPwhCNmjIKfrLw2R9C8vksV4q1NwfSScrxZ+c6fL3Pkd1oFBTNSoeBQRhqEE3\r\nb/Iqe/sFP4W5U4gXK8ZFRV00HTzgVqDCNHd20mtE792x9qk+7dXayMJmANw1nD9fSeeRcjkub80f\r\nlZ3h0QNWILWC7v6RuaIjnO2st+NbgcGfD99rR2cinFol7bfJSVfw8SdyH9w8vWESN5hZgIRvarxc\r\nDHEDdCXJRcEjWWQdkDhD1VXZISoSoWkCAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgEGMBIGA1UdEwEB\r\n/wQIMAYBAf8CAQAwHQYDVR0OBBYEFDUDIxMwMCEfj73z317BsKkgiCywMB8GA1UdIwQYMBaAFFED\r\nmaGN4tE8OTNLv6Cob4xj0wS3MA0GCSqGSIb3DQEBBQUAA4IBAQB6CpUq3ixUhAT55B2lynIqv42b\r\noFcbxiPNARCKt6E4LJZzeOJPystyQROdyXs6q8pOjauXVrURHnpN0Jh4eDKmGrEBvcBxvsW5uFV+\r\nEzWhlP0mYC4Bg/aHwrUkQ4Py03rczsu9MfkqoL0csQkxZQLTFeZZqvA3lcjwr2FiYHvpTvV9gSXZ\r\nvMmqHB5atHr1OiQvPzQeowHz923a8HLqFeF1CWv9wwD+iFNUpM0cr9TDUXVbLSMynU0wDDi5eeIW\r\nrPiIXE7gbAzRiVXEHRj9RtszD1G/ZZ/hHb3qmydbzGjvvJmPa6MXiVmPM0KHm2GgAR7V8fyANot9\r\nB1HoBoAvaGnO\n-----END CERTIFICATE-----\nCertificate[3]:\n-----BEGIN CERTIFICATE-----\nMIID/jCCAuagAwIBAgIBATANBgkqhkiG9w0BAQUFADCBjzETMBEGCgmSJomT8ixkARkWA2NvbTEX\r\nMBUGCgmSJomT8ixkARkWB2V4YW1wbGUxGTAXBgNVBAoMEEV4YW1wbGUgQ29tIEluYy4xITAfBgNV\r\nBAsMGEV4YW1wbGUgQ29tIEluYy4gUm9vdCBDQTEhMB8GA1UEAwwYRXhhbXBsZSBDb20gSW5jLiBS\r\nb290IENBMB4XDTE2MDUwNDIwNDUyNloXDTI2MDUwNDIwNDUyNlowgY8xEzARBgoJkiaJk/IsZAEZ\r\nFgNjb20xFzAVBgoJkiaJk/IsZAEZFgdleGFtcGxlMRkwFwYDVQQKDBBFeGFtcGxlIENvbSBJbmMu\r\nMSEwHwYDVQQLDBhFeGFtcGxlIENvbSBJbmMuIFJvb3QgQ0ExITAfBgNVBAMMGEV4YW1wbGUgQ29t\r\nIEluYy4gUm9vdCBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKcNMLJ1/LIAAr/S\r\nW+guFsZH8sxtY1MpxwjEPbPvQfXp0chNqqUgN87z6wLijLeYfoj+P5Boc0BqvXq0XZGL/Oi3ObCm\r\nUdKUoFcK7ULra19HgoIwpUo9bcV3EEHtxFw6e67HwPvtS7oRbSbsXPA4kjM93JzEhedP1V23vGZO\r\n8P9Avfi8XfC9yplzAg58phkf7K9XGX0+XBpOj88bPjCsg2i5ya9na1P2V9heDGcRLkQHO6XNrdQj\r\nzIvOCNIjouNb71VKOTx6eehOQZktXGxRrHo9qkPKCOkStK30ARjK6YHchrECbU+tlBQ2/HGxAcuW\r\nusCywqTAX9N1jdfSPwBUZ3MCAwEAAaNjMGEwDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMB\r\nAf8wHQYDVR0OBBYEFFEDmaGN4tE8OTNLv6Cob4xj0wS3MB8GA1UdIwQYMBaAFFEDmaGN4tE8OTNL\r\nv6Cob4xj0wS3MA0GCSqGSIb3DQEBBQUAA4IBAQA3SQm3Axz0HfIcFH2qJ/kkUDHs70gzURWPbHQq\r\nFRTc+p1nXT8flcWDqAEp7hMVWCxq6rf+Nj9Ej4eJ4RWumkF2UyEnUR+YjPp4gX/k4b4+zOsGQCvp\r\nP/LJ8Eg1gIz6c/Lin1vu0ddpGZMI+pPVym7MNkxnKSM2TyOfj2AOrjD5SHzc3A9avjrWYdHOF3jr\r\nF9JxfjX4rzmwh8SgJySQKjtKubS/m4bafrJ7ccFCLXxberWxUl3J4QMRNaxzLUazqNwhnLTw+/0Z\r\nhHgW8hQ5L0xhdrqQERp3Rw6bhLOBL6AtaoxjaWHK2Weps6wZ4CjfZRP/AFlscD6hWl22tRqOt7xp\n-----END CERTIFICATE-----\n\n\n*******************************************\n*******************************************\n\n\n' }";

      var test2 = "{ certificate: '\nKeystore type: JKS\nKeystore provider: SUN\n\nYour keystore contains 1 entry\n\nAlias name: kirk\nCreation date: May 4, 2016\nEntry type: PrivateKeyEntry\nCertificate chain length: 3\nCertificate[1]:\n-----BEGIN CERTIFICATE-----\nMIID2jCCAsKgAwIBAgIBBTANBgkqhkiG9w0BAQUFADCBlTETMBEGCgmSJomT8ixkARkWA2NvbTEX\r\nMBUGCgmSJomT8ixkARkWB2V4YW1wbGUxGTAXBgNVBAoMEEV4YW1wbGUgQ29tIEluYy4xJDAiBgNV\r\nBAsMG0V4YW1wbGUgQ29tIEl";

      return reply(200).state('searchguard_certificates', test2);
    }
  });

}

