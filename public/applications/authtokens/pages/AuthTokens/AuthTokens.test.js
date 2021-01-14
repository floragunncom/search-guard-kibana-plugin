/*
 *    Copyright 2020 floragunn GmbH
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
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { TableColumnText, TableColumnTokenName, TableColumnDate } from './AuthTokens';

describe('AuthTokens', () => {
  let renderer;

  beforeEach(() => {
    renderer = new ShallowRenderer();
  });

  test('TableColumnText for revoked token', () => {
    const tokenId = '398uricjejkvh';
    const value = 'value';
    const revokedAt = 1;

    const tree = renderer.render(
      <TableColumnText value={value} revokedAt={revokedAt} dataTestSubj={`tc-${tokenId}`} />
    );
    expect(tree).toMatchSnapshot();
  });

  test('TableColumnText', () => {
    const tokenId = '398uricjejkvh';
    const value = 'value';

    const tree = renderer.render(<TableColumnText value={value} dataTestSubj={`tc-${tokenId}`} />);
    expect(tree).toMatchSnapshot();
  });

  test('TableColumnTokenName for revoked token', () => {
    const tokenId = '398uricjejkvh';
    const tokenName = 'aToken';
    const revokedAt = 1;
    const onClick = jest.fn();

    const tree = renderer.render(
      <TableColumnTokenName
        value={tokenName}
        revokedAt={revokedAt}
        dataTestSubj={`sgTableCol-TokenName-${tokenId}`}
        onClick={onClick}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  test('TableColumnTokenName', () => {
    const tokenId = '398uricjejkvh';
    const tokenName = 'aToken';
    const onClick = jest.fn();

    const tree = renderer.render(
      <TableColumnTokenName
        value={tokenName}
        dataTestSubj={`sgTableCol-TokenName-${tokenId}`}
        onClick={onClick}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  test('TableColumnDate with no value', () => {
    const tokenId = '398uricjejkvh';

    const tree = renderer.render(<TableColumnDate dataTestSubj={`tc-${tokenId}`} />);
    expect(tree).toMatchSnapshot();
  });
});
