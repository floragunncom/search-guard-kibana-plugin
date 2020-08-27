/* eslint-disable @kbn/eslint/require-license-header */
export function mockResponseOkImplementation({ body }) {
  return {
    status: 200,
    payload: { ...body },
    options: { body },
  };
}

export function mockSuccessResponse(resp = {}) {
  return {
    status: 200,
    payload: {
      ok: true,
      resp,
    },
    options: {
      body: {
        ok: true,
        resp,
      },
    },
  };
}

export function mockErrorResponse(message, statusCode = 500) {
  return {
    status: 200,
    payload: {
      ok: false,
      resp: {
        message: message,
        statusCode,
      },
    },
    options: {
      body: {
        ok: false,
        resp: {
          message: message,
          statusCode,
        },
      },
    },
  };
}

const ELASTICSEARCH_ERROR = 'elasticsearch error';

export function mockElasticsearchErrorResponse(resp = {}) {
  const mockError = mockErrorResponse(ELASTICSEARCH_ERROR, 400);
  mockError.payload.resp = { ...mockError.payload.resp, ...resp };
  mockError.options.body.resp = { ...mockError.options.body.resp, ...resp };

  return mockError;
}

export function mockElasticsearchError(statusCode = 400) {
  return {
    body: {
      status: {},
      watch_id: '123',
      error: {
        message: ELASTICSEARCH_ERROR,
        detail: {},
      },
    },
    statusCode,
  };
}
