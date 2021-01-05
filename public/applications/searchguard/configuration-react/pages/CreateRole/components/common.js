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
import { EuiLink } from '@elastic/eui';
import PropTypes from 'prop-types';
import { collectionOfPermissionsText } from '../../../utils/i18n/common';
import { createActionGroupText } from '../../../utils/i18n/action_groups';
import { APP_PATH } from '../../../utils/constants';

export function ActionGroupsHelpText({ history }) {
  return (
    <>
      {collectionOfPermissionsText}
      {', '}
      <EuiLink
        data-test-subj="sgCreateActionGroup"
        onClick={() => history.push(APP_PATH.CREATE_ACTION_GROUP)}
      >
        {createActionGroupText}
      </EuiLink>
    </>
  );
}

ActionGroupsHelpText.propTypes = {
  history: PropTypes.object.isRequired,
};
