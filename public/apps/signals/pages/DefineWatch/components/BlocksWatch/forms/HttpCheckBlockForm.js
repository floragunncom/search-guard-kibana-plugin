/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';

export function HttpCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Request: {checkBlock.request}</p>
      <p>TLS: {checkBlock.tls}</p>
    </>
  );
}
