export const unfoldMultiLineString = (string = '') => {
  const regexJSONKeysAndValues = new RegExp('("(?:[^"])*?")', 'g');

  return string.replace(regexJSONKeysAndValues, (match, value) => {
    const areNewLines = value.includes('\\n');
    if (areNewLines) {
      return `"""\n${JSON.parse(value)}\n"""`;
    }

    return value;
  });
};
