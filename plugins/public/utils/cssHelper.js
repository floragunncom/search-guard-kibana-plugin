import {camelCase} from "lodash";

export function stringCSSToReactStyle(style = '') {
  if (typeof style !== 'string') {
    return style;
  }
  return style.split(';').reduce((acc, style) => {
    const [, key, value] = style.match(/(.+):(.+)/) || [];
    if (key) {
      acc[camelCase(key.trim())] = value.trim();
    }
    return acc;
  }, {});
}
