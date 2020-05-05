import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { isEmpty } from 'lodash';
import { EuiSpacer } from '@elastic/eui';
import { addText } from '../../../../utils/i18n/common';
import {
  emptyIndexPermissionsText,
  indexPermissionsText,
} from '../../../../utils/i18n/roles';
import { EmptyPrompt, AddButton } from '../../../../components';
import { indexPermissionToUiIndexPermission } from '../../utils';
import { INDEX_PERMISSION } from '../../utils/constants';
import IndexPatterns from './IndexPatterns';

const addIndexPermission = arrayHelpers => {
  arrayHelpers.push(indexPermissionToUiIndexPermission(INDEX_PERMISSION));
};

const IndexPermissions = ({
  httpClient,
  indexPermissions,
  allActionGroups,
  allSinglePermissions,
  isDlsEnabled,
  isFlsEnabled,
  isAnonymizedFieldsEnabled,
  onTriggerErrorCallout
}) => (
  <FieldArray
    name="_indexPermissions"
    render={arrayHelpers => (
      <Fragment>
        <AddButton onClick={() => addIndexPermission(arrayHelpers)} />
        <EuiSpacer />

        {isEmpty(indexPermissions) ? (
          <EmptyPrompt
            titleText={indexPermissionsText}
            bodyText={emptyIndexPermissionsText}
            createButtonText={addText}
            onCreate={() => { addIndexPermission(arrayHelpers); }}
          />
        ) : (
          <IndexPatterns
            httpClient={httpClient}
            indexPermissions={indexPermissions}
            allActionGroups={allActionGroups}
            allSinglePermissions={allSinglePermissions}
            arrayHelpers={arrayHelpers}
            isDlsEnabled={isDlsEnabled}
            isFlsEnabled={isFlsEnabled}
            isAnonymizedFieldsEnabled={isAnonymizedFieldsEnabled}
            onTriggerErrorCallout={onTriggerErrorCallout}
          />
        )}
      </Fragment>
    )}
  />
);

IndexPermissions.propTypes = {
  httpClient: PropTypes.func.isRequired,
  indexPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      index_patterns: PropTypes.array.isRequired,
      fls: PropTypes.array.isRequired,
      masked_fields: PropTypes.array.isRequired,
      allowed_actions: PropTypes.shape({
        actiongroups: PropTypes.array.isRequired,
        permissions: PropTypes.array.isRequired
      })
    })
  ).isRequired,
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  isDlsEnabled: PropTypes.bool.isRequired,
  isFlsEnabled: PropTypes.bool.isRequired,
  isAnonymizedFieldsEnabled: PropTypes.bool.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default IndexPermissions;
