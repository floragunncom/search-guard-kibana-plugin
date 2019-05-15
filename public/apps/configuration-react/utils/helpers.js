import { BrowserStorageService } from '../services';
import { get } from 'lodash';

export const stringifyPretty = json => JSON.stringify(json, null, 2);

export const checkIfLicenseValid = () => ({
  isValid: !!get(BrowserStorageService.systemInfo(), 'sg_license.is_valid'),
  messages: get(BrowserStorageService.systemInfo(), 'sg_license.msgs'),
});

export const readFileAsText = (file, FileReader = window.FileReader) => {
  if (!file) return;
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = ({ target: { result } }) => resolve(result);
    fr.onerror = err => reject(err);
    fr.readAsText(file);
  });
};

export const isSinglePermission = permission => permission.startsWith('cluster:') || permission.startsWith('indices:');
