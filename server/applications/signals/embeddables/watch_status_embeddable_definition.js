/*
 *    Copyright 2026 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { schema } from '@kbn/config-schema';

/**
 * Panel config of the watch status embeddable as it is stored in a dashboard and exposed
 * through Kibana's dashboards REST API ("dashboards as code").
 *
 * The shape must match what the public embeddable serializes, see
 * public/applications/signals/embeddables/watch_status/watch_status_embeddable.js (serializeState):
 * the Signals `watchId` plus the standard panel title fields written by Kibana's title manager.
 *
 * No transforms are registered: stored state and REST state are identical, and Kibana's dashboard
 * plugin already applies the generic title transforms (e.g. legacy `hidePanelTitles`) itself.
 */
export const watchStatusEmbeddableSchema = schema.object(
  {
    watchId: schema.string({
      minLength: 1,
      meta: { description: 'Id of the Signals watch whose status is displayed in the panel.' },
    }),
    title: schema.maybe(schema.string()),
    description: schema.maybe(schema.string()),
    hide_title: schema.maybe(schema.boolean()),
    hide_border: schema.maybe(schema.boolean()),
  },
  { meta: { description: 'Search Guard Signals watch status panel config' } }
);

/**
 * Definition for embeddable.registerEmbeddableServerDefinition().
 * Kibana uses it to validate and document panels of this type in the dashboards REST API.
 */
export const getWatchStatusEmbeddableServerDefinition = () => ({
  title: 'Search Guard Signals watch status',
  getSchema: () => watchStatusEmbeddableSchema,
});
