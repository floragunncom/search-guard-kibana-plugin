export default class AlertingService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  get(path) {
    return this.httpClient.get(path)
      .then(({ data }) => {
        if (!data.ok) throw data.resp;
        return data;
      });
  }

  delete(path) {
    return this.httpClient.delete(path)
      .then(({ data }) => {
        if (!data.ok) throw data.resp;
        return data;
      });
  }

  post(path, payload = {}) {
    return this.httpClient.post(path, payload)
      .then(({ data }) => {
        if (!data.ok) throw data.resp;
        return data;
      });
  }

  put(path, payload = {}) {
    return this.httpClient.put(path, payload)
      .then(({ data }) => {
        if (!data.ok) throw data.resp;
        return data;
      });
  }
}
