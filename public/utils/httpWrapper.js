/**
 * This is a temporary compability wrapper between angular's $http and NP's fetch
 */
export class HttpWrapper {
  constructor(coreHttp) {
    this.http = coreHttp;
  }

  setCoreHttp(coreHttp) {
    this.http = coreHttp;
    return this;
  }

  getBasePath() {
    return this.http.basePath.get();
  }

  get(url, options) {
    return this.http.get(url, options)
      .then(response => {
        return {
          data: response
        }
      });
  }

  post(url, data = null, options = {}) {
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    return this.http.post(url, options);
  }

}