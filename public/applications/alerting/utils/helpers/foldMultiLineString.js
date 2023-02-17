export const foldMultiLineString = (string = '') => {
  const regexMultilineString = new RegExp('"{3}(?:\\s*\\r?\\n)?((?:.|\\r?\\n)*?)(?:\\r?\\n\\s*)?"{3}', 'g');
  return string.replace(regexMultilineString, (match, value) => JSON.stringify(value));
};
