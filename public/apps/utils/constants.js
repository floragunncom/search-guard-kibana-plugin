import chrome from 'ui/chrome';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');

export const CODE_EDITOR = {
  theme: IS_DARK_THEME ? 'twilight' : 'github',
  tabSize: 2,
  useSoftTabs: true,
  highlightActiveLine: true
};