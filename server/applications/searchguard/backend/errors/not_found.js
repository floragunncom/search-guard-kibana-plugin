/**
 * Thrown when an object is not found.
 */
export default class NotFoundError extends Error {
  /**
   * Creates a new NotFoundError.
   *
   * @param {string} message - The error message.
   * @param {Error} params - Optional error properties.
   */
  constructor(message, ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }

    this.name = this.constructor.name;

    params = params || [];
    const error = params[0];

    if (error instanceof Error) {
      this.inner = error;
    }
  }
}
