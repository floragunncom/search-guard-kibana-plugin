/* eslint-disable @kbn/eslint/require-license-header */
export default function serverError(error = {}) {
  let message = error.message;

  // SG plugin body error is string
  let { body: { error: bodyMessage } = {} } = error;

  // ES body error is object
  if (typeof bodyMessage === 'object') {
    bodyMessage = bodyMessage.message || bodyMessage.reason;
  }

  if (bodyMessage) {
    message = bodyMessage;
  }

  return {
    message,
    body: error.body,
    path: error.path,
    statusCode: error.statusCode || 500,
  };
}
