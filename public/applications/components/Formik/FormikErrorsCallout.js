/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2021 floragunn GmbH
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
import { EuiErrorBoundary, EuiFlexGroup, EuiFlexItem, EuiCallOut } from '@elastic/eui';
import { cloneDeep } from 'lodash';

export function formikErrorsToErrors({ errors = {}, maxDepth = 10, maxMessages = 3 } = {}) {
  const _errors = cloneDeep(errors);
  const messages = [];

  dfs(_errors, 0);
  return messages.slice(0, maxMessages);

  function dfs(input, d) {
    if (d > maxDepth) {
      return;
    } else if (React.isValidElement(input) || (typeof input === 'string' && !!input.length)) {
      messages.push(input);
    } else if (Array.isArray(input)) {
      for (const v of input) dfs(v, d + 1);
    } else if (typeof input === 'object' && input !== null) {
      for (const [, v] of Object.entries(input)) dfs(v, d + 1);
    }
  }
}

export function FormikErrorsCallOut({ errors = {}, maxDepthToSearch, maxMessages } = {}) {
  if (!Object.keys(errors).length) return null;

  const _errors = formikErrorsToErrors({ errors, maxDepthToSearch, maxMessages });
  if (!_errors.length) _errors.push('Form error');

  return (
    <EuiErrorBoundary>
      <EuiFlexGroup direction="column" gutterSize="xs" data-test-subj="sp.formikErrorsCallOut">
        {_errors.map((msg, idx) => {
          return (
            <EuiFlexItem key={idx}>
              <EuiCallOut key={idx} size="s" iconType="alert" color="danger" title={msg} />
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
    </EuiErrorBoundary>
  );
}
