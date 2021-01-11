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

export function mappingsToFieldNames(mappings = {}) {
  const dataTypes = {};

  Object.entries(mappings)
    .map((mappings) => {
      const { mappings: { properties = {} } = {} } = mappings.pop();
      return properties;
    })
    .forEach((docMappings) => {
      Object.entries(docMappings).forEach(([field, mappings]) => {
        getTypeFromField(mappings, field, dataTypes);
      });
    });

  return dataTypes;
}
