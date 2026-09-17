/*
 *    Copyright 2026 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Reconstructs the origin used by the browser for the current Kibana request.
 *
 * The protocol comes from Kibana's server information. The authority comes from
 * the request headers because it reflects the host (and optional port) used by
 * the browser:
 *
 * - HTTP/2 and newer protocols use the `:authority` pseudo-header. It takes
 *   precedence when both header forms are available.
 * - HTTP/1.x uses the `Host` header, which is used as the fallback.
 *
 * The authority is kept intact so the resulting origin retains its port. A
 * missing authority results in null so callers can fall back to their configured
 * frontend URL. Unexpected failures are allowed to propagate to the caller.
 */
export function getBrowserOrigin(request, kibanaCore) {
  const serverInfo = kibanaCore.http.getServerInfo();
  const protocol = serverInfo.protocol;
  const host = request.headers[':authority'] ?? request.headers['host'] ?? null;

  return host === null ? null : `${protocol}://${host}`;
}

/**
 * Extracts the hostname from HTTP/2+ `:authority`, removing an optional port
 * and handling bracketed IPv6 addresses. For HTTP/1.x requests, an optional
 * port is stripped from the `Host` header as well.
 */
export function getBrowserHost(request) {
  const authority = request.headers[':authority'];

  if (authority) {
    return new URL(`http://${authority}`).hostname;
  }

  const host = request.headers['host'] ?? null;
  if (host === null) {
    return null;
  }

  const colonIndex = host.lastIndexOf(':');
  // A colon after a closing IPv6 bracket separates the port. Colons inside a
  // bracketed IPv6 address are part of the host and must be preserved.
  return colonIndex > host.lastIndexOf(']') ? host.substring(0, colonIndex) : host;
}
