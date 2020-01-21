export function callWithRequestFactory(server, request, clusterName, plugins = []) {
  return function (...rest) {
    const esPlugin = server.plugins.elasticsearch;
    const cluster = esPlugin.getCluster(clusterName);

    if (!cluster) {
      return esPlugin
        .createCluster(clusterName, { plugins })
        .callWithRequest(request, ...rest);
    }

    return cluster.callWithRequest(request, ...rest);
  };
}
