export const unfoldMultiLineString = (string = '') => {
  try {
    return string.replace(/("(?:\\"|[^"])*?")/g, (match, value) => {
      const areNewLines = /\\r|\\n/.exec(value);
      if (areNewLines) {
        return `"""\n${JSON.parse(value.replace(/^\s*\n|\s*$/g, ''))}\n"""`;
      }

      return value;
    });
  } catch (error) {
    console.error('unfoldMultiLineString -- Fail to unfold multi-line string', error);
  }
  
  return string;
};
