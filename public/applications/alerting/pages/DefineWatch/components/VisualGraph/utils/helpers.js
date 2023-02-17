/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
  * Copyright 2015-2019 _floragunn_ GmbH
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

import _ from 'lodash';

import { selectOptionValueToText } from '../../WatchExpressions/expressions/utils/helpers';
import {
  AGGREGATION_TYPES_OPTIONS,
  UNITS_OF_TIME,
} from '../../WatchExpressions/expressions/utils/constants';
import { Y_DOMAIN_BUFFER, DEFAULT_MARK_SIZE } from './constants';
import { ALL_DOCUMENTS, AGGREGATIONS_TYPES } from '../../../utils/constants';

export function getYTitle(values) {
  return _.get(values, '_ui.fieldName[0].label', 'count');
}

export function getLeftPadding(yDomain) {
  const [min, max] = yDomain;
  const maxLength = Math.max(min.toString().length, max.toString().length);
  // These are MAGIC numbers..
  // 80 is the default left padding
  // 9 is the length when we start adding to base
  // 10 is the number we multiply to add left padding for each digit
  const multiplier = Math.max(maxLength - 9, 0);
  return 80 + multiplier * 10;
}

export function getXDomain(data) {
  const minDate = data[0];
  const maxDate = data[data.length - 1];
  return [minDate.x, maxDate.x];
}

export function getYDomain(data) {
  if (!data.length) return [0, 10];
  const max = data.reduce((accu, { y }) => Math.max(accu, y), 0);
  const min = data.reduce((accu, { y }) => Math.min(accu, y), 0);
  if (max === min) return [0, 10];
  const maxBuffer = Math.ceil(max * Y_DOMAIN_BUFFER);
  const minBuffer = Math.floor(min * Y_DOMAIN_BUFFER);
  return [minBuffer, maxBuffer];
}

export function formatYAxisTick(value) {
  return value.toLocaleString();
}

export function getAnnotationData(xDomain, yDomain, thresholdValue) {
  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;
  let yValue = thresholdValue;
  if (thresholdValue > yMax) yValue = yMax;
  if (thresholdValue < yMin) yValue = yMin;
  return [{ x: xMin, y: yValue }, { x: xMax, y: yValue }];
}

export function getDataFromResponse(response) {
  if (!response) return [];

  // top hits agg
  if (_.get(response, 'aggregations.bucketAgg')) {
    const buckets = _.get(response, 'aggregations.bucketAgg.buckets', []);
    return buckets.reduce((acc, bucket) => {
      const dateAggBuckets = _.get(bucket, 'dateAgg.buckets', []);
      acc[bucket.key] = dateAggBuckets.map(getXYValues).filter(filterInvalidYValues);
      return acc;
    }, {});
  }

  const buckets = _.get(response, 'aggregations.dateAgg.buckets', []);
  return {
    [ALL_DOCUMENTS]: buckets.map(getXYValues).filter(filterInvalidYValues)
  };
}

export function getXYValues(bucket) {
  const x = new Date(bucket.key_as_string);
  const path = bucket.metricAgg ? 'metricAgg.value' : 'doc_count';
  const y = _.get(bucket, path, null);
  return { x, y };
}

export function filterInvalidYValues({ y }) {
  return !isNaN(parseFloat(y));
}

export function getMarkData(data) {
  return data.map(d => ({ ...d, size: DEFAULT_MARK_SIZE }));
}

export function getAggregationTitle(values) {
  const aggregationType = selectOptionValueToText(values._ui.aggregationType, AGGREGATION_TYPES_OPTIONS);
  const when = `WHEN ${aggregationType}`;
  const fieldName = _.get(values, '_ui.fieldName[0].label');
  const of = `OF ${fieldName}`;
  const overDocuments = values._ui.overDocuments;
  const over = `OVER ${_.lowerCase(overDocuments)}`;
  const value = values._ui.bucketValue;
  const unit = selectOptionValueToText(values._ui.bucketUnitOfTime, UNITS_OF_TIME);
  const forTheLast = `FOR THE LAST ${value} ${unit}`;

  if (overDocuments === AGGREGATIONS_TYPES.TOP_HITS) {
    const topHitsAggSize = _.get(values, '_ui.topHitsAgg.size');
    const topHitsAggField = _.get(values, '_ui.topHitsAgg.field[0].label');
    const topHitsAggOrder = _.get(values, '_ui.topHitsAgg.order');
    const topHitsNumberAndTerm = `${topHitsAggSize} ${topHitsAggField} ${topHitsAggOrder}`;
    return `${when} ${of} ${over} ${topHitsNumberAndTerm} ${forTheLast}`;
  }

  if (aggregationType === 'count()') {
    return `${when} ${over} ${forTheLast}`;
  }

  return `${when} ${of} ${over} ${forTheLast}`;
}

export function isGraphDataEmpty(data) {
  if (!data) return true;
  return Object.values(data).every(buckets => !buckets.length);
}
