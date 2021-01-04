/*
 *    Copyright 2020 floragunn GmbH
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

export default [
  { name: 'cluster:admin/ingest/pipeline/delete' },
  { name: 'cluster:admin/ingest/pipeline/get' },
  { name: 'cluster:admin/ingest/pipeline/put' },
  { name: 'cluster:admin/ingest/pipeline/simulate' },
  { name: 'cluster:admin/ingest/processor/grok/get' },
  { name: 'cluster:admin/reindex/rethrottle' },
  { name: 'cluster:admin/repository/delete' },
  { name: 'cluster:admin/repository/get' },
  { name: 'cluster:admin/repository/put' },
  { name: 'cluster:admin/repository/verify' },
  { name: 'cluster:admin/reroute' },
  { name: 'cluster:admin/script/delete' },
  { name: 'cluster:admin/script/get' },
  { name: 'cluster:admin/script/put' },
  { name: 'cluster:admin/settings/update' },
  { name: 'cluster:admin/snapshot/create' },
  { name: 'cluster:admin/snapshot/delete' },
  { name: 'cluster:admin/snapshot/get' },
  { name: 'cluster:admin/snapshot/restore' },
  { name: 'cluster:admin/snapshot/status' },
  { name: 'cluster:admin/snapshot/status*' },
  { name: 'cluster:admin/tasks/cancel' },
  { name: 'cluster:admin/tasks/test' },
  { name: 'cluster:admin/tasks/testunblock' },
  { name: 'cluster:monitor/allocation/explain' },
  { name: 'cluster:monitor/health' },
  { name: 'cluster:monitor/main' },
  { name: 'cluster:monitor/nodes/hot_threads' },
  { name: 'cluster:monitor/nodes/info' },
  { name: 'cluster:monitor/nodes/liveness' },
  { name: 'cluster:monitor/nodes/stats' },
  { name: 'cluster:monitor/nodes/usage' },
  { name: 'cluster:monitor/remote/info' },
  { name: 'cluster:monitor/state' },
  { name: 'cluster:monitor/stats' },
  { name: 'cluster:monitor/task' },
  { name: 'cluster:monitor/task/get' },
  { name: 'cluster:monitor/tasks/list' },
  { name: 'indices:data/read/async_search/*' },
];
