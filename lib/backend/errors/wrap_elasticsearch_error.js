import { get } from 'lodash';
import Boom from 'boom';

/**
 * Wraps an Elasticsearch client error into a backend error.
 *
 * @param {Error} error - An Elasticsearch client error.
 */
export default function wrapElasticsearchError(error) {

  let statusCode = error.statusCode;
  if (error.status) {
    statusCode = error.status;
  }
  if (!statusCode) {
    statusCode = 500;
  }
  let message = get(error, 'body.message');
  if (!message) {
    message = error.message;
  }
  return Boom.create(statusCode, message);
}
