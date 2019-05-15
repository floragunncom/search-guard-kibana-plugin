import { SESSION_STORAGE } from '../utils/constants';

export default class BrowserStorageService {
  static systemInfo() {
    return JSON.parse(sessionStorage.getItem(SESSION_STORAGE.SYSTEMINFO), '{}');
  }

  static restApiInfo() {
    return JSON.parse(sessionStorage.getItem(SESSION_STORAGE.RESTAPIINFO), '{}');
  }

  static sgUser() {
    return JSON.parse(sessionStorage.getItem(SESSION_STORAGE.SG_USER), '{}');
  }
}
