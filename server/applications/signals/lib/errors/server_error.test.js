/* eslint-disable @kbn/eslint/require-license-header */
import serverError from './server_error';

describe('server_error', () => {
  test('can build SG plugin error', () => {
    expect(
      serverError({
        statusCode: 422,
        body: {
          error: 'some error',
        },
      })
    ).toEqual({
      statusCode: 422,
      body: {
        error: 'some error',
      },
      message: 'some error',
    });
  });

  test('can build ES error', () => {
    expect(
      serverError({
        statusCode: 422,
        body: {
          error: {
            message: 'some error',
          },
        },
      })
    ).toEqual({
      statusCode: 422,
      body: {
        error: {
          message: 'some error',
        },
      },
      message: 'some error',
    });
  });

  test('can build ES error if no message but reason', () => {
    expect(
      serverError({
        statusCode: 422,
        body: {
          error: {
            reason: 'some error',
          },
        },
      })
    ).toEqual({
      statusCode: 422,
      body: {
        error: {
          reason: 'some error',
        },
      },
      message: 'some error',
    });
  });

  test('can build runtime error', () => {
    expect(serverError(new Error('some error'))).toEqual({
      message: 'some error',
      statusCode: 500,
    });
  });
});
