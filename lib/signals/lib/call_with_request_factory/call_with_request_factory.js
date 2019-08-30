import { once } from 'lodash';
import { elasticsearchSignalsPlugin } from '../elasticsearch_signals_plugin';
import { CLUSTER } from '../../../../utils/signals/constants';

const callWithRequest = once((server) => {
  const { callWithRequest } = server.plugins.elasticsearch.createCluster(CLUSTER.ALERTING, {
    plugins: [elasticsearchSignalsPlugin]
  });
  return callWithRequest;
});

export const callWithRequestFactory = (server, request) =>
  (...rest) => callWithRequest(server)(request, ...rest);
