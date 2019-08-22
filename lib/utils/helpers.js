export function enrichApiError(error) {
  const { body: { reason = '' } = {} } = error;
  error.output.payload.reason = reason;
  return error;
}
