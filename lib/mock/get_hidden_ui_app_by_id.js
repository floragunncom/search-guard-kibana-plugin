export default function getHiddenUiAppById() {
  const hiddenAppsById = new Map();

  class UiApp {
    constructor({ id, main, hidden, listed, url, pluginId, kbnServer = {} }) {
      this._id = id;
      this._main = main;
      this._hidden = hidden;
      this._listed = listed;
      this._url = url;
      this._pluginId = pluginId;
      this._kbnServer = kbnServer;
    }
  }

  hiddenAppsById.set('searchguard-login', new UiApp({
    id: 'searchguard-login',
    main: 'plugins/searchguard/apps/login/login',
    hidden: true,
    listed: false,
    url: '/app/searchguard-login',
    pluginId: 'searchguard'
  }));

  return hiddenAppsById.get(id);
}
