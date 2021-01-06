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

/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright 2015-2019 _floragunn_ GmbH
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
import PropTypes from 'prop-types';
import { FormikSelect } from '../../../../components';
import { hasError, isInvalid, validateEmptyField } from '../../../../utils/validate';
import { timeFieldText, theFieldUsedFotXAxisText } from '../../../../utils/i18n/watch';

const WatchTimeField = ({ dataTypes }) => {
  // Default empty option + options from index mappings mapped to ui select form
  const dateFields = Array.from(dataTypes.date || []);
  const options = [''].concat(dateFields).map((option) => ({ value: option, text: option }));
  return (
    <FormikSelect
      name="_ui.timeField"
      formRow
      formikFieldProps={{ validate: validateEmptyField }}
      rowProps={{
        label: timeFieldText,
        helpText: theFieldUsedFotXAxisText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        options,
      }}
    />
  );
};

export default WatchTimeField;

WatchTimeField.propTypes = {
  dataTypes: PropTypes.object.isRequired,
};
