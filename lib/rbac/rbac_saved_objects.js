import SearchguardSavedObjectsClient from "./searchguard_saved_objects_client";

export function registerSavedObjectClient(server, searchguardBackend) {
  const { savedObjects } = server;

  savedObjects.setScopedSavedObjectsClientFactory(({request}) => {
    const adminCluster = server.plugins.elasticsearch.getCluster('admin');
    const {callWithRequest} = adminCluster;
    const callCluster = (...args) => callWithRequest(request, ...args);
    const callWithRequestRepository = savedObjects.getSavedObjectsRepository(callCluster);

    return new SearchguardSavedObjectsClient(
      request,
      searchguardBackend,
      callWithRequestRepository,
      savedObjects
    );
  });
}