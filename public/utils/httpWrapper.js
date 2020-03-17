/**
 * This is a temporary compability wrapper between angular's $http and NP's fetch.
 * @todo If we stick with this as a wrapper, we probably need to take
 * care of error handling
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

  delete(url) {
    return this.http.delete(url)
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

    return this.http.post(url, options)
      .then(response => {
        return {
          data: response
        }
      });
  }

  put(url, data = null, options = {}) {
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    return this.http.put(url, options)
      .then(response => {
        return {
          data: response
        }
      });
  }

}