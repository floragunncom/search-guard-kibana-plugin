/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';

export function TransformCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Source: {checkBlock.source}</p>
    </>
  );
}
