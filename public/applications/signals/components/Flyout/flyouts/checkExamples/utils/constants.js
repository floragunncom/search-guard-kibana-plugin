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

export const CHECKS = {
  HTTP: 'http',
  FULL_TEXT: 'full_text',
  TERM_LEVEL: 'term_level',
  COMPOUND: 'compound',
  JOIN: 'join',
  GEO_QUERIES: 'geo',
  SPECIALIZED: 'specialized',
  SPAN: 'span',
  METRICS_AGGREGATIONS: 'metrics_aggs',
  BUCKET_AGGREGATIONS: 'bucket_aggs',
  PIPELINE_AGGREGATIONS: 'pipeline_aggs',
  MATRIX_AGGREGATIONS: 'matrix_aggs',
  CONDITION: 'condition',
  STATIC: 'static',
  TRANSFORM: 'transform',
  CALC: 'calc',
};
