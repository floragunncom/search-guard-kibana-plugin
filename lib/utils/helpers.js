export function enrichApiError(error) {
  const { body: { reason = '' } = {} } = error;
  if (error.output) { // the error is from SG Elasticsearch plugin
    error.output.payload.reason = reason;
  }
  return error;
}
