/* eslint-disable @kbn/eslint/require-license-header */
import { kibanaConfigRoute } from './kibana_config';

export function registerRoutes({ router, config, logger }) {
  kibanaConfigRoute({ router, config, logger });
}
