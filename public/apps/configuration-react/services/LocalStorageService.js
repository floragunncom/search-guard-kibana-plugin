import { LOCAL_STORAGE_NAME } from '../utils/constants';

export default class LocalStorageService {
  get cache() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME), '{}');
  }

  set cache(cache = {}) {
    localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(cache));
  }

  setCacheByPath(appPath, cache = {}) {
    localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify({
      ...this.cache, [appPath]: { ...this.cache[appPath], ...cache }
    }));
  }
}
