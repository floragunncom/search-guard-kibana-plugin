import { API } from '../utils/constants';

export default class SystemService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  getSystemInfo() {
    return this.httpClient.get(API.SYSTEM_INFO);
  }

  uploadLicense(licenseString) {
    return this.httpClient.post(API.LICENSE, { sg_license: licenseString });
  }

  getIndices() {
    return this.httpClient.get(API.INDICES);
  }
}
