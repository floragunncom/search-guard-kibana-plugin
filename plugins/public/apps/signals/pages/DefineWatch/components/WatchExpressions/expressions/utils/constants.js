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

import { lowerCase } from 'lodash';
import { ALL_DOCUMENTS, AGGREGATIONS_TYPES } from '../../../../utils/constants';

export const POPOVER_STYLE = { zIndex: '200', padding: '20px' };

export const Expressions = {
  THRESHOLD: 'THRESHOLD',
  WHEN: 'WHEN',
  OF_FIELD: 'OF_FIELD',
  OVER: 'OVER',
  FOR_THE_LAST: 'FOR_THE_LAST',
};

export const NUMBER_TYPES = [
  'long',
  'integer',
  'short',
  'byte',
  'double',
  'float',
  'half_float',
  'scaled_float',
];

export const UNITS_OF_TIME = [
  { value: 'm', text: 'minute(s)' },
  { value: 'h', text: 'hour(s)' },
  { value: 'd', text: 'day(s)' },
];

export const OVER_TYPES = [
  { value: ALL_DOCUMENTS, text: ALL_DOCUMENTS },
  { value: AGGREGATIONS_TYPES.TOP_HITS, text: lowerCase(AGGREGATIONS_TYPES.TOP_HITS) },
];

export const AGGREGATION_TYPES_OPTIONS = [
  { value: AGGREGATIONS_TYPES.AVG, text: 'average()' },
  { value: AGGREGATIONS_TYPES.COUNT, text: 'count()' },
  { value: AGGREGATIONS_TYPES.SUM, text: 'sum()' },
  { value: AGGREGATIONS_TYPES.MIN, text: 'min()' },
  { value: AGGREGATIONS_TYPES.MAX, text: 'max()' },
];

export const THRESHOLD_ENUM_OPTIONS = [
  { value: 'ABOVE', text: 'IS ABOVE' },
  { value: 'BELOW', text: 'IS BELOW' },
  { value: 'EXACTLY', text: 'IS EXACTLY' },
];

export const ORDER_TYPES = [
  { value: 'asc', text: 'asc' },
  { value: 'desc', text: 'desc' }
];
