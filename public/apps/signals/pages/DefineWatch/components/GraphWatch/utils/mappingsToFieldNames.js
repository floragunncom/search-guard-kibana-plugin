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

function mustSkip(mapping) {
  const isDisabled = mapping.enabled === false;
  const hasIndexDisabled = mapping.index === false;
  const isNestedDataType = mapping.type === 'nested';
  return isDisabled || hasIndexDisabled || isNestedDataType;
}

function getTypeFromField(mappings, field = '', dataTypes) {
  if (mustSkip(mappings)) return dataTypes;

  if (mappings.properties) {
    Object.entries(mappings.properties).forEach(([childField, value]) => {
      getTypeFromField(value, field ? `${field}.${childField}` : field, dataTypes);
    });
  }

  const { type } = mappings;
  if (type) {
    if (dataTypes[type]) {
      dataTypes[type].add(field);
    } else {
      dataTypes[type] = new Set([field]);
    }
  }

  return dataTypes;
}

export default function mappingsToFieldNames(mappings = {}) {
  const dataTypes = {};

  Object.keys(mappings).forEach(indexName => {
    const { mappings: { properties = {} } } = mappings[indexName];
    Object.entries(properties).forEach(([field, mappings]) => {
      getTypeFromField(mappings, field, dataTypes);
    });
  });

  return dataTypes;
}
