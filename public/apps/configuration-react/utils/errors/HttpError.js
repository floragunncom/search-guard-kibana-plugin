export default class HttpError extends Error {
  constructor(message, status = null, stack = null, name = null) {
    super();
    this.message = message;
    this.status = status;

    this.name = name || this.constructor.name;
    this.stack = stack || null;
  }
}
