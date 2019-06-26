import { APP_CACHE_NAME } from '../utils/constants';

export default class AppCacheService {
  get cache() {
    return JSON.parse(localStorage.getItem(APP_CACHE_NAME), '{}');
  }

  set cache(cache = {}) {
    localStorage.setItem(APP_CACHE_NAME, JSON.stringify(cache));
  }

  setCacheByPath(appPath, cache = {}) {
    localStorage.setItem(APP_CACHE_NAME, JSON.stringify({
      ...this.cache, [appPath]: { ...this.cache[appPath], ...cache }
    }));
  }
}
