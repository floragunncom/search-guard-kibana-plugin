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
import renderer from 'react-test-renderer';
import { ErrorToast } from './ErrorToast';

describe(ErrorToast.name, () => {
  it('renders correctly', () => {
    const error = new Error('nasty!');

    const tree = renderer.create(<ErrorToast error={error} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders details correctly', () => {
    const error = new Error('nasty!');
    error.body = {
      attributes: {
        body: {
          a: [0, 1],
          b: { c: 2 },
        },
      },
    };

    const tree = renderer.create(<ErrorToast error={error} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly if details cannot be parsed', () => {
    const error = new Error('nasty!');
    const a = { next: null };
    const b = { next: null };
    a.next = b;
    b.next = a;
    error.body = { attributes: { body: { a } } };

    const tree = renderer.create(<ErrorToast error={error} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly if custom message and details', () => {
    const error = new Error('nasty!');
    const errorMessage = 'Super nasty!!!';
    const errorDetails = {
      attributes: {
        body: {
          a: [0, 1],
          b: { c: 2 },
        },
      },
    };

    const tree = renderer
      .create(<ErrorToast error={error} errorMessage={errorMessage} errorDetails={errorDetails} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
