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
