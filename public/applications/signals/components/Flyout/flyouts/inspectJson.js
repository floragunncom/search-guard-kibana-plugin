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
import { EuiCodeEditor, EuiText, EuiTitle } from '@elastic/eui';
import { jsonText } from '../../../utils/i18n/common';
import { stringifyPretty } from '../../../utils/helpers';

const inspectJson = ({ title, json, editorTheme }) => ({
  flyoutProps: {
    size: 'm',
  },
  headerProps: { hasBorder: true },
  header: (
    <EuiTitle size="m">
      <h2>{title}</h2>
    </EuiTitle>
  ),
  body: (
    <div>
      <EuiText>{jsonText}</EuiText>
      <EuiCodeEditor
        mode="json"
        theme={editorTheme}
        height="600px"
        width="100%"
        readOnly
        value={stringifyPretty(json)}
        setOptions={{ fontSize: '12px' }}
      />
    </div>
  ),
});

export default inspectJson;
